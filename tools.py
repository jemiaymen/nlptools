from sqlitedict import SqliteDict
import pandas as pd
import os


class Tag():
    def __init__(self, pos='data/pos.db', ner='data/ner.db'):
        self.path_pos = pos
        self.path_ner = ner
        self.check()

    def check(self, unique_pos_in='data/pos_unique.tab',
              unique_pos_out='data/pos_unique.db',
              unique_ner_in='data/ner_unique.tab',
              unique_ner_out='data/ner_unique.db'
              ):
        """ 
        init constants from data POS NER

        Keyword arguments:
        pos_in pos_out and ner_in ner_out

        pos_in line structure as [tag \t description ] : NOUN    noun, singular or mass
        ner_in line structure as [type \t description ] : ORG	Companies, agencies, institutions, etc.

        Raises:
            Exception:  check your pos data path or check your ner data path
        """
        if not os.path.exists(unique_pos_out):
            if not os.path.exists(unique_pos_in):
                raise Exception(
                    'check your pos unique path ({})'.format(unique_pos_in)
                )
            else:
                unique_pos = pd.read_csv(unique_pos_in, sep='\t')
                with SqliteDict(unique_pos_out, autocommit=True) as db:
                    for p in unique_pos.iterrows():
                        db[p[1][0]] = p[1][1]
                    self.POS = list(db.items())
        else:
            db = SqliteDict(unique_pos_out)
            self.POS = list(db.items())
            db.close()

        if not os.path.exists(unique_ner_out):
            if not os.path.exists(unique_ner_in):
                raise Exception(
                    'check your ner unique path ({})'.format(unique_ner_in)
                )
            else:
                unique_ner = pd.read_csv(unique_ner_in, sep='\t')
                with SqliteDict(unique_ner_out, autocommit=True) as db:
                    for p in unique_ner.iterrows():
                        db[p[1][0]] = p[1][1]
                    self.NER = list(db.items())
        else:
            db = SqliteDict(unique_ner_out)
            self.NER = list(db.items())
            db.close()

    def tag(self, word, id, is_pos=True):
        """ add tagging for POS or NER

        Args:
            word (str): word to tag
            id (numeric): id for ner or pos
            is_pos (bool, optional): True if you chose POS tagging else NER tagging. Defaults to True.

        Raises:
            Exception: if you enter not valid id pos
            Exception: if you enter not valid id ner
        """

        if is_pos:
            try:
                pos = self.POS[id]
                with SqliteDict(self.path_pos, autocommit=True) as db:
                    db[word] = pos[0]

                return pos
            except IndexError:
                raise Exception('id pos not found !')

        else:
            try:
                ner = self.NER[id]
                with SqliteDict(self.path_ner, autocommit=True) as db:
                    db[word] = ner[0]

                return ner
            except IndexError:
                raise Exception('id ner not found !')

    def pos(self, word):
        """ 
        check pos if exist

        Args:
            word (str): word to check if pos exist

        Returns:
            str: POS if exist else None
        """

        pos = None
        with SqliteDict(self.path_pos) as db:
            try:
                pos = db[word]
            except Exception:
                pass
        return pos

    def ner(self, word):
        """ 
        check ner if exist

        Args:
            word (str): word to check if ner exist

        Returns:
            str: NER if exist else None
        """

        ner = None
        with SqliteDict(self.path_ner) as db:
            try:
                ner = db[word]
            except Exception:
                pass
        return ner

    def pos_line(self, line):
        re = {}
        for word in line.split():
            re[word] = self.pos(word)
        return re

    def ner_line(self, line):
        re = {}
        for word in line.split():
            re[word] = self.ner(word)
        return re

    def gen_doc(self, is_pos=True):

        if is_pos:
            path = 'data/pos.tab'
            db = SqliteDict(self.path_pos)
            pos = pd.DataFrame.from_dict(db.items())
            db.close()
            pos.to_csv(path, sep='\t', index=None,
                       encoding='utf8', header=None)
            return 'generate pos file in : {}'.format(path)
        else:
            path = 'data/ner.tab'
            db = SqliteDict(self.path_ner)
            ner = pd.DataFrame.from_dict(db.items())
            db.close()
            ner.to_csv(path, sep='\t', index=None,
                       encoding='utf8', header=None)
            return 'generate ner file in : {}'.format(path)

class Project():
    def __init__(self, name, type, path):
        self.name = name
        self.type = type
        self.path = path
        self.db = 'projects/' + self.name + '/setting.db'

        if not os.path.exists('projects/' + self.name):
            os.mkdir('projects/' + self.name)
        self.setting()

    def setting(self):
        self.data = pd.read_csv(
            self.path, encoding='utf8', sep='\n', header=None
        )

        with SqliteDict(self.db, autocommit=True, tablename='project') as db:
            db['done'] = 0
            db['data_count'] = int(self.data.count())
            db['project_type'] = self.type

    def next(self):
        with SqliteDict(self.db, autocommit=True, tablename='project') as db:
            if db['done'] >= db['data_count']:
                raise Exception('all data in project done')
            d = int(db['done'])
        return self.data[0][d]

    def done(self):
        with SqliteDict(self.db, autocommit=True, tablename='project') as db:
            db['done'] += 1

class Labels(Project):

    def __init__(self, name, path, type='Labels'):
        super().__init__(name=name, path=path, type=type)
        self.db = 'projects/' + name + '/setting.db'
        self.f = 'projects/' + name + '/done.tab'

    def add_label(self, label, color):
        with SqliteDict(self.db, autocommit=True, tablename='labels') as db:
            db[label] = color

    def get_labels(self):
        with SqliteDict(self.db, tablename='labels') as db:
            re = list(db.items())
        return re

    def tag(self, text, label):
        db = SqliteDict(self.db, tablename='labels')
        if label not in db.keys():
            raise Exception('Label not found check your labels')

        with open(self.f, 'a+') as file:
            line = text + '\t' + label + '\n'
            file.write(line)
        self.done()
        return True

class Ner(Project,Tag):

    def __init__(self,name,path,type='NER'):
        super().__init__(name=name,path=path,type=type)
        self.db = 'projects/' + name + '/setting.db'
        super().__init__(pos='data/pos.db', ner='data/ner.db')

    def valid_line(self):
        self.done()
        return True