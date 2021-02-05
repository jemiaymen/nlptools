from sys import path
from fastapi import FastAPI
from tools import Tag, Labels, Ner, Pos, Work, TYPE_PROJECT


app = FastAPI(docs_url='/nlptools/docs')
T = Tag()


"""" method for static feature"""


@app.get("/POS")
def POS():
    return T.POS


@app.get("/NER")
def NER():
    return T.NER


@app.get("/TYPE_PROJECT")
def type_project():
    return TYPE_PROJECT


@app.get("/PROJECTS")
def projects():
    return Work.get_all()


@app.get("/LABELS/{name}")
def get_labels(name: str):
    l = Labels(name)
    return l.get_labels()


@app.post("/LABELS/{name}/add")
def add_label(name: str, label:  str, color: str):
    l = Labels(name)
    return l.add_label(label, color)


""""method for create projects"""


@app.post("/project/ner/create/")
def create_ner_project(project: str, data: str):
    n = Ner(name=project, path=data)
    return n.name


@app.post("/project/pos/create/")
def create_pos_project(project: str, data: str):
    p = Pos(name=project, path=data)
    return p.name


@app.post("/project/label/create")
def create_label_project(project: str, data: str):
    l = Labels(name=project, path=data)
    return l.name


""""tag pos ner label"""


@app.post("/POS/tag")
def add_pos(word: str, id: int):
    re = T.tag(is_pos=True, word=word, id=id)
    return re


@app.post("/NER/tag")
def add_ner(word: str, id: int):
    re = T.tag(is_pos=False, word=word, id=id)
    return re


@app.post("/LABEL/{name}/tag")
def tag_label(name: str, line: str, label: str):
    l = Labels(name)
    return l.tag(line, label)


@app.get("/NER/line")
def ner_line(line: str):
    return T.ner_line(line)


@app.get("/POS/line")
def pos_line(line: str):
    return T.pos_line(line)


""""generate pos ner file"""


@app.post("/POS/gen")
def generate_pos():
    return T.gen_doc(is_pos=True)


@app.post("/NER/gen")
def generate_ner():
    return T.gen_doc(is_pos=False)


""""get line pos ner label"""


@app.get("/project/{name}/pos/next")
def get_pos_line(name: str):
    p = Pos(name)
    return p.next()


@app.get("/project/{name}/ner/next")
def get_ner_line(name: str):
    n = Ner(name)
    return n.next()


@app.get("/project/{name}/label/next")
def get_label_line(name: str):
    l = Labels(name)
    return l.next()


""""validate line pos ner """


@app.post("/project/{name}/pos/validate")
def valid_pos(name: str):
    p = Pos(name)
    return p.valid_line()


@app.post("/project/{name}/ner/validate")
def valid_ner(name: str):
    n = Ner(name)
    return n.valid_line()


# uvicorn api:app --reload --port 80 --host 0.0.0.0
