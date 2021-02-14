import { TextAnnotator } from 'react-text-annotate'
import React from 'react'
import axios from 'axios'
import { Card, API_BASE_URL } from './Project'
import { Spinner, Button, Input } from 'reactstrap';


class Ner extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            text: '',
            tag: '',
            value: {},
            colors: {},
            NER: [],
            project: props.project,
            isLoading: false,
            err: null,
            isDone: false
        };


    }

    getNER() {
        return axios.get(API_BASE_URL + 'NER');
    }

    getText() {
        return axios.get(API_BASE_URL + 'project/' + this.state.project + '/ner/next');
    }

    getValue(line) {
        return axios.get(API_BASE_URL + 'NER/line?line=' + line);
    }

    handleChange = value => {
        this.setState({ value })
    }

    handleTagChange = e => {
        this.setState({ tag: e.target.value })
    }

    validateLine = e => {
        e.preventDefault();

        this.setState({ isLoading: true });


        axios.post(API_BASE_URL + 'NER/tags', { data: this.state.value }).then((d) => {
            axios.post(API_BASE_URL + 'project/ner/validate?project=' + this.state.project, {})
                .then((response) => {
                    this.setState({ isLoading: true });

                    this.getNER().then((res) => {

                        this.setState({
                            colors: res.data.colors,
                            NER: res.data.item
                        });


                        this.getText().then((res_text) => {

                            if (res_text.data == false) {
                                this.setState({
                                    isDone: true
                                });
                            } else {
                                this.setState({
                                    text: res_text.data
                                });

                                this.getValue(res_text.data).then((result) => {

                                    this.setState({
                                        value: result.data.value,
                                        isLoading: false
                                    });
                                }).catch((err) => {
                                    this.setState({
                                        err: err.message,
                                        isLoading: false
                                    })
                                });
                            }
                        }).catch((err) => {
                            this.setState({
                                err: err.message,
                                isLoading: false
                            })
                        });
                    }).catch((err) => {
                        this.setState({
                            err: err.message,
                            isLoading: false
                        })
                    });



                })
                .catch((err) => {
                    this.setState({
                        err: err.message,
                        isLoading: false
                    });
                });
        }).catch((err) => {
            this.setState({
                err: err.message,
                isLoading: false
            });
        });

    }

    componentDidMount() {

        this.setState({ isLoading: true });

        this.getNER().then((res) => {

            this.setState({
                colors: res.data.colors,
                NER: res.data.item,
                tag: res.data.item[0]
            });


            this.getText().then((res_text) => {
                if (res_text.data == false) {
                    this.setState({
                        isDone: true
                    });
                } else {
                    this.setState({
                        text: res_text.data
                    });
                    this.getValue(res_text.data).then((result) => {

                        this.setState({
                            value: result.data.value,
                            isLoading: false
                        });
                    }).catch((err) => {
                        this.setState({
                            err: err.message,
                            isLoading: false
                        })
                    });
                }
            }).catch((err) => {
                this.setState({
                    err: err.message,
                    isLoading: false
                })
            });
        }).catch((err) => {
            this.setState({
                err: err.message,
                isLoading: false
            })
        });



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
        }
        else if (this.state.err) {
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
                <div>
                    <Card>

                        <Input type="select" onChange={this.handleTagChange} value={this.state.tag}>
                            {this.state.NER.map((x) => <option >{x}</option>)};
                        </Input>
                        <TextAnnotator
                            style={{
                                fontFamily: 'IBM Plex Sans',
                                maxWidth: 880,
                                lineHeight: 2,
                                fontSize: 20,
                                padding: 10
                            }}
                            content={this.state.text}
                            value={this.state.value}
                            onChange={this.handleChange}
                            getSpan={span => ({
                                ...span,
                                tag: this.state.tag,
                                color: this.state.colors[this.state.tag],
                            })}
                        />
                        <Button outline color="success" onClick={this.validateLine} disabled={this.state.isLoading}>Validate NER</Button>{' '}
                    </Card>
                </div>

            );
        }

    }
}

export default Ner;