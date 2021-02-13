import { TextAnnotator } from 'react-text-annotate'
import React from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost/';


const Card = ({ children }) => (
    <div
        style={{
            boxShadow: '0 2px 4px rgba(0,0,0,.1)',
            margin: 6,
            maxWidth: 500,
            padding: 16,
        }}
    >
        {children}
    </div>
)


class Ner extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            text: '',
            tag: '',
            value: {},
            colors: {},
            NER: [],
            project: 'jdid',
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
                <div>Project done</div>
            );
        }
        else if (this.state.err) {
            return (<div>Error was found : {this.state.err}</div>);
        } else if (this.state.isLoading) {
            return (
                <div>Loading ...</div>
            );
        } else {
            return (
                <div>
                    <Card>
                        <select onChange={this.handleTagChange} value={this.state.tag}>
                            {this.state.NER.map((x) => <option key={x}>{x}</option>)};
          </select>
                        <TextAnnotator
                            style={{
                                fontFamily: 'IBM Plex Sans',
                                maxWidth: 600,
                                lineHeight: 1.5,
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
                        <button onClick={this.validateLine} disabled={this.state.isLoading}> Validate NER </button>
                    </Card>
                </div>

            );
        }

    }
}
export default Ner;