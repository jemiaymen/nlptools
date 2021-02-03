from sqlitedict import SqliteDict
import pandas as pd

class Pos():
    def __init__(self,path_u='data/pos_unique.tab',path='data/pos.db'):
        self.u = pd.read_csv('pos_unique.tab',sep='\t')
        