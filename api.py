from fastapi import FastAPI, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware

from tools import Tag, Labels, Ner, Pos, Work, TYPE_PROJECT


app = FastAPI(docs_url='/nlptools/docs')

origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://localhost",
    "https://localhost",
    "http://localhost:8080",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


T = Tag()


"""" method for static feature"""


@app.get("/POS")
def POS():
    colors = {}
    item = []
    for i in T.POS:
        colors[i[0]] = i[1]
        item.append(i[0])
    return {'colors': colors, 'item': item}


@app.get("/NER")
def NER():
    colors = {}
    item = []
    for i in T.NER:
        colors[i[0]] = i[1]
        item.append(i[0])
    return {'colors': colors, 'item': item}


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
async def create_ner_project(project: str, data: UploadFile = File(...)):
    with open('data/projects/' + project + '.tab', mode='wb+') as f:
        c = data.file.read()
        f.write(c)

    n = Ner(name=project)
    return n.name


@app.post("/project/pos/create/")
async def create_pos_project(project: str, data: UploadFile = File(...)):
    with open('data/projects/' + project + '.tab', mode='wb+') as f:
        c = data.file.read()
        f.write(c)

    p = Pos(name=project)
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


@app.post("/POS/tags")
async def add_multi_pos(request: Request):
    data = await request.json()
    T.tags(data['data'], is_pos=True)
    return True


@app.post("/NER/tags")
async def add_multi_ner(request: Request):
    data = await request.json()
    T.tags(data, is_pos=False)
    return True


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


@app.post("/project/pos/validate")
def valid_pos(project: str):
    p = Pos(project)
    return p.valid_line()


@app.post("/project/ner/validate")
def valid_ner(project: str):
    n = Ner(project)
    return n.valid_line()


# uvicorn api:app --reload --port 80 --host 0.0.0.0
