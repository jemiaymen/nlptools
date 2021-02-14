import React from 'react'
import axios from 'axios'
import { Button, Form, FormGroup, Label, Input, FormText, Spinner, Toast, ToastBody, ToastHeader } from 'reactstrap'


const API_BASE_URL = 'http://localhost:90/';

const Card = ({ children }) => (
    <div
        style={{
            boxShadow: '0 2px 4px rgba(2,2,2,.5)',
            margin: 20,
            maxWidth: 900,
            padding: 20

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
            type: 'label',
            ext: '.tab',
            err: null,
            success: null,
            project: 'jdid'
        };
    }

    labelFileExist() {
        try {
            const path = './public/' + this.state.project + '_labels.tab';
            require(`${path}`);
            return true;
        } catch (err) {
            return false;
        }
    }

    generate() {
        if (this.state.type == 'label') {
            if (!this.labelFileExist()) {
                this.setState({
                    err: 'Error Label File not exist you must create label project'
                })
            } else {
                this.setState({
                    success: true
                });
            }
        } else {
            axios.post(API_BASE_URL + this.state.type.toUpperCase() + '/gen', {}).then((res) => {
                this.setState({
                    success: true
                });
            }).catch((err) => {
                this.setState({
                    err: err.message
                });
            })
        }

    }

    componentDidMount() {
        this.generate();
    }
    render() {

        if (this.state.type == 'label') {
            if (this.state.success) {
                return (<a href={'/' + this.state.project + '_labels.tab'} download>Click to download</a>);
            } else if (this.state.err) {
                return (
                    <div>
                        <h4 className="text-danger">Error was found : {this.state.err}</h4>
                    </div>
                );
            }
            else {
                return (
                    <div>
                        <Spinner color="warning" />
                    </div>
                );
            }
        }
        else if (this.state.success) {
            return (<a href={'/' + this.state.type + this.state.ext} download>Click to download</a>);
        }
        else if (this.state.err) {
            return (
                <div>
                    <h4 className="text-danger">Error was found : {this.state.err}</h4>
                </div>
            );
        }
        else {
            return (
                <div>
                    <Spinner color="warning" />
                </div>
            );
        }

    }
}

class Project extends React.Component {

}



export default CreateProjectForm;

export { Download, Card, API_BASE_URL }; 