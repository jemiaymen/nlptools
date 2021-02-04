from fastapi import FastAPI
from tools import Tag


app = FastAPI(docs_url='/')
T = Tag()


@app.get("/POS")
def POS():
    return T.POS


@app.get("/NER")
def NER():
    return T.NER


@app.post("/POS/{word}/{id}")
def add_pos(word: str, id: int):
    re = T.tag(is_pos=True, word=word, id=id)
    return re


@app.post("/NER/{word}/{id}")
def add_ner(word: str, id: int):
    re = T.tag(is_pos=False, word=word, id=id)
    return re


@app.get("/NER/line/{line}")
def ner_line(line: str):
    return T.ner_line(line)


@app.get("/POS/line/{line}")
def pos_line(line: str):
    return T.pos_line(line)


@app.post("/POS/gen")
def generate_pos():
    return T.gen_doc(is_pos=True)


@app.post("/NER/gen")
def generate_ner():
    return T.gen_doc(is_pos=False)


# uvicorn api: app - -reload - -port 80 - -host 0.0.0.0
