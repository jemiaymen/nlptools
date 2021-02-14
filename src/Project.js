import React from 'react'
import axios from 'axios'
import { Button, Form, FormGroup, Label, Input, FormText, Spinner, Toast, ToastBody, ToastHeader, Row, Col } from 'reactstrap'


const API_BASE_URL = 'http://localhost:8000/';

const Card = ({ children }) => (
    <div
        style={{
            boxShadow: '0 2px 4px rgba(2,2,2,.5)',
            margin: 20,
            padding: 20,
            maxHeight: 800,
            overflowY: 'auto'

        }}
    >
        {children}
    </div>
)

class CreateProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            project: '',
            data: {},
            type: 'ner',
            err: null,
            success: null,
            isLoading: false
        };
    }

    createProject(project, file) {
        const formData = new FormData();
        formData.append('data', file);

        this.setState({ isLoading: true });

        axios.post(API_BASE_URL + 'project/' + this.state.type + '/create?project=' + project, formData).then((res) => {
            this.setState({
                success: true,
                project: '',
                data: {},
                isLoading: false
            });
            this.props.handle();
        }).catch((err) => {
            this.setState({
                err: err.message,
                isLoading: false
            });
        });
    }

    handleSubmit = e => {
        e.preventDefault();
        this.createProject(this.state.project, this.state.data);
    }

    handleProjectChange = e => {
        this.setState({
            project: e.target.value
        });
    }

    handleTypeChange = e => {
        this.setState({
            type: e.target.value
        });
    }

    handleDataChange = e => {
        this.setState({
            data: e.target.files[0]
        });
    }

    render() {
        if (this.state.err) {
            return (
                <div>
                    <h4 className="text-danger">Error was found : {this.state.err}</h4>
                </div>
            );
        } else if (this.state.isLoading) {
            return (
                <div>
                    <Spinner color="warning" />
                </div>
            );
        }
        else if (this.state.success) {
            return (
                <div>
                    <Card>
                        <Form onSubmit={this.handleSubmit}>
                            <FormGroup>
                                <Label for="projectnam">Project Name</Label>
                                <Input type="text" id="projectname"
                                    placeholder="Project" required
                                    onChange={this.handleProjectChange}
                                    value={this.state.project}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label for="datafile">Data File</Label>
                                <Input type="file"
                                    id="datafile"
                                    required
                                    onChange={this.handleDataChange}
                                    accept='.txt,.tab'
                                />

                                <FormText color="muted">
                                    You should upload text file no other format accepted.
                                </FormText>
                            </FormGroup>
                            <FormGroup>
                                <Label for="typeproject">Project Type</Label>
                                <Input type="select" id="typeproject" onChange={this.handleTypeChange} value={this.state.type} required>
                                    <option value="ner">NER</option>
                                    <option value="pos">POS</option>
                                    <option value="label">LABEL</option>
                                </Input>
                            </FormGroup>
                            <Button color="warning">Create Project</Button>
                        </Form>
                    </Card>
                    <div className="p-3 my-2 rounded">
                        <Toast>
                            <ToastHeader>
                                NLP tools
                            </ToastHeader>
                            <ToastBody>
                                Project Create with Success
                            </ToastBody>
                        </Toast>
                    </div>
                </div>
            );
        }
        return (
            <Card>
                <Form onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Label for="projectnam">Project Name</Label>
                        <Input type="text" id="projectname"
                            placeholder="Project" required
                            onChange={this.handleProjectChange}
                            value={this.state.project}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label for="datafile">Data File</Label>
                        <Input type="file"
                            id="datafile"
                            required
                            onChange={this.handleDataChange}
                            accept='.txt,.tab'
                        />

                        <FormText color="muted">
                            You should upload text file no other format accepted.
                        </FormText>
                    </FormGroup>
                    <FormGroup>
                        <Label for="typeproject">Project Type</Label>
                        <Input type="select" id="typeproject" onChange={this.handleTypeChange} value={this.state.type} >
                            <option value="ner">NER</option>
                            <option value="pos">POS</option>
                            <option value="label">LABEL</option>
                        </Input>
                    </FormGroup>
                    <Button color="warning">Create Project</Button>
                </Form>
            </Card>
        );
    }
}

class Download extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: props.type,
            ext: '.tab',
            err: null,
            success: null,
            project: props.project,
            isLoadingDownload: false,
            fileExist: false
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick = e => {
        this.generate();
    }

    labelFileExist() {
        const path = '/' + this.state.project + '_labels.tab';
        axios.get(path).then((res) => {
            this.setState({
                fileExist: true
            });
        }).catch((err) => {
            this.setState({
                fileExist: false,
                err: err.message
            });
        });
    }

    generate() {

        this.setState({
            isLoadingDownload: true
        });

        if (this.state.type == 'label') {
            this.labelFileExist();
            if (this.state.fileExist) {
                this.setState({
                    err: 'Error Label File not exist you must create label project',
                    isLoadingDownload: false
                })
            } else {
                this.setState({
                    success: true,
                    isLoadingDownload: false
                });
            }
        } else {
            axios.post(API_BASE_URL + this.state.type.toUpperCase() + '/gen', {}).then((res) => {
                this.setState({
                    success: true,
                    isLoadingDownload: false
                });
            }).catch((err) => {
                this.setState({
                    err: err.message,
                    isLoadingDownload: false
                });
            })
        }

    }


    render() {

        if (this.state.isLoadingDownload) {
            return (
                <div>
                    <Spinner color="warning" />
                </div>
            );
        } else if (this.state.err) {
            return (
                <div>
                    <h4 className="text-danger">Error was found : {this.state.err}</h4>
                </div>
            );
        } else {
            if (this.state.type == 'label') {
                return (<Button color="warning" href={'/' + this.state.project + '_labels.tab'} onClick={this.handleClick} download>Download</Button >);
            } else {
                return (<Button color="warning" href={'/' + this.state.type + this.state.ext} onClick={this.handleClick} download>Download</Button >);
            }
        }





    }
}

class CreateLabelForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            project: props.project,
            label: '',
            colors: [],
            color: '',
            err: null,
            success: null,
            isLoading: false
        };
    }

    createLabel(project, label, color) {

        const url = API_BASE_URL + 'LABELS/add?name=' + project + '&label=' + label + '&color=' + encodeURIComponent(color);

        this.setState({ isLoading: true });

        axios.post(url, {}).then((res) => {
            if (res.data == true) {
                this.setState({
                    isLoading: false,
                    success: true,
                    label: null
                });
                this.props.handle();
            } else {
                this.setState({
                    isLoading: false,
                    err: 'Error to add Label please try again',
                    success: false
                });
            }
        }).catch((err) => {
            this.setState({
                isLoading: false,
                err: err.message,
                success: false
            });
        });

    }

    handleChangeLabel = e => {
        this.setState({
            label: e.target.value
        });
    }

    handleChangeColor = e => {
        this.setState({
            color: e.target.value
        });
    }

    initColors() {
        this.setState({
            isLoading: true
        });

        axios.get(API_BASE_URL + 'POS').then((res) => {
            const colors = Object.values(res.data['colors']);
            this.setState({
                colors,
                isLoading: false,
                color: colors[0]
            });
        }).catch((err) => {
            this.setState({
                isLoading: false,
                err: err.message
            });
        });
    }

    handleSubmit = e => {
        e.preventDefault();
        this.createLabel(this.state.project, this.state.label, this.state.color);
    }


    componentDidMount() {
        this.initColors();
    }

    render() {

        if (this.state.isLoading) {
            return (
                <div>
                    <Spinner color="primary" />
                </div>
            );
        } else if (this.state.err) {
            return (
                <div>
                    <h4 className="text-danger">Error was found : {this.state.err}</h4>
                </div>
            );
        } else if (this.state.success) {
            return (
                <Row>
                    <Col>
                        <Card>
                            <Form onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <Label for="projectlabel">Label</Label>
                                    <Input type="text" id="projectlabel"
                                        placeholder="Label ..." required
                                        onChange={this.handleChangeLabel}
                                        value={this.state.label}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label for="labelcolor">Label Color</Label>
                                    <Input type="select" id="labelcolor" onChange={this.handleChangeColor} value={this.state.color} >
                                        {this.state.colors.map((x) => <option key={x.toString()}>{x}</option>)};
                                    </Input>
                                </FormGroup>

                                <Button color="info">Create Label</Button>
                            </Form>
                        </Card>
                    </Col>
                    <Col>
                        <Card>
                            <div className="p-3 my-2 rounded">
                                <Toast>
                                    <ToastHeader>
                                        NLP tools
                                    </ToastHeader>
                                    <ToastBody>
                                        Label Create with Success
                                    </ToastBody>
                                </Toast>
                            </div>
                        </Card>
                    </Col>
                </Row>
            );
        } else {
            return (
                <Row>
                    <Col>
                        <Card>
                            <Form onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <Label for="projectlabel">Label</Label>
                                    <Input type="text" id="projectlabel"
                                        placeholder="Label ..." required
                                        onChange={this.handleChangeLabel}
                                        value={this.state.label}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label for="labelcolor">Label Color</Label>
                                    <Input type="select" id="labelcolor" onChange={this.handleChangeColor} value={this.state.color} >
                                        {this.state.colors.map((x) => <option key={x.toString()}>{x}</option>)};
                                    </Input>
                                </FormGroup>

                                <Button color="info">Create Label</Button>
                            </Form>

                        </Card>
                    </Col>
                </Row>
            );
        }
    }

}



export default CreateProjectForm;

export { Download, Card, API_BASE_URL, CreateLabelForm }; 