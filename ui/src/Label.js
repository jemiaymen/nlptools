import React from 'react'
import axios from 'axios'
import { Card, API_BASE_URL, Download, CreateLabelForm } from './Project'
import { Spinner, Button, Input, Label as Lbl, Row, Col, FormGroup } from 'reactstrap';

class Label extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            err: null,
            success: false,
            project: props.project,
            isDone: false,
            text: '',
            label: '',
            labels: []
        };

        this.handle = this.handle.bind(this);
    }


    getLabels() {

        this.setState({
            isLoading: true
        });

        axios.get(API_BASE_URL + 'LABELS/' + this.state.project).then((res) => {

            this.setState({
                isLoading: false,
                labels: res.data
            });

        }).catch((err) => {
            this.setState({
                err: err.message,
                isLoading: false
            });
        });
    }


    getText() {
        this.setState({
            isLoading: true
        });
        axios.get(API_BASE_URL + 'project/' + this.state.project + '/label/next').then((res) => {

            if (res.data == false) {
                this.setState({
                    isDone: true,
                    isLoading: false
                });
            } else {
                this.setState({
                    text: res.data,
                    isLoading: false
                });
            }

        }).catch((err) => {
            this.setState({
                err: err.message,
                isLoading: false
            });
        });
    }

    handleLabelChange = e => {
        this.setState({ label: e.target.value })
    }

    createLabelTag() {

        this.setState({
            isLoading: true
        });

        const url = API_BASE_URL + 'LABEL/' + this.state.project + '/tag?name=' + this.state.project + '&line=' + this.state.text + '&label=' + this.state.label;

        axios.post(url, {}).then((res) => {
            if (res.data == true) {
                this.getText();
            } else {
                this.setState({
                    isLoading: false,
                    err: 'Error add label please try again'
                });
            }
        }).catch((err) => {
            this.setState({
                isLoading: false,
                err: err.message
            });
        });


    }

    handle() {
        this.getLabels();
    }

    handleCreateLabelTag = e => {
        e.preventDefault();
        this.createLabelTag();
    }

    componentDidMount() {
        this.getLabels();
        this.getText();
    }



    getSnapshotBeforeUpdate(prevProps) {
        return { updateRequired: prevProps.project !== this.props.project };
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        const newproject = this.props.project;
        if (snapshot.updateRequired) {
            this.setState({ project: newproject, isDone: false });
            this.getLabels();
            this.getText();
        }
    }

    render() {

        if (this.state.isDone) {
            return (
                <div>
                    <h3 className="text-success">
                        Project : {this.state.project} Done
                    </h3>
                </div>
            );
        } else if (this.state.err) {
            return (
                <div>
                    <h4 className="text-danger">Error was found : {this.state.err}</h4>
                </div>
            );
        } else if (this.state.isLoading) {
            return (
                <div>
                    <Spinner color="success" />
                </div>
            );
        } else {
            return (
                <Row>
                    <Col>
                        <Card>

                            <FormGroup>
                                <Lbl for="lbl">Labels</Lbl>
                                <Input type="select" id="lbl" onChange={this.handleLabelChange} value={this.state.label}>
                                    {this.state.labels.map((x) => <option key={x[0].toString()} style={{ backgroundColor: x[1] }}>{x[0]}</option>)};
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Input type="textarea" value={this.state.text} readOnly />
                            </FormGroup>

                            <Button color="info" onClick={this.handleCreateLabelTag}>Validate Label</Button>

                        </Card>
                        <Card>
                            <Download type='label' project={this.state.project} />
                        </Card>
                    </Col>
                    <Col>
                        <CreateLabelForm project={this.state.project} handle={this.handle} />
                    </Col>
                </Row>
            );
        }
    }
}

export default Label;