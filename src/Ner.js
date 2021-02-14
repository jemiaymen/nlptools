import { TextAnnotator } from 'react-text-annotate'
import React from 'react'
import axios from 'axios'
import { Card, API_BASE_URL, Download } from './Project'
import { Spinner, Button, Input, Table, Row, Col } from 'reactstrap';


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

    updateNer() {
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

    componentDidMount() {
        this.updateNer();
    }

    getSnapshotBeforeUpdate(prevProps) {
        return { updateRequired: prevProps.project !== this.props.project };
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        const newproject = this.props.project;
        if (snapshot.updateRequired) {
            this.setState({ project: newproject, isDone: false });
            this.updateNer();
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
                <Row>
                    <Col>
                        <Card>
                            <Input type="select" onChange={this.handleTagChange} value={this.state.tag}>
                                {this.state.NER.map((x) => <option key={x.toString()}>{x}</option>)};
                        </Input>
                            <TextAnnotator
                                style={{
                                    fontFamily: 'IBM Plex Sans',
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
                            <Button outline color="success" onClick={this.validateLine}>Validate NER</Button>{' '}
                        </Card>
                        <Card>
                            <Download type='ner' project={this.state.project} />
                        </Card>
                    </Col>
                    <Col>
                        <Card>
                            <center>
                                <h4>Description</h4>
                            </center>
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>
                                            tag
                                        </th>
                                        <th>
                                            description
                                        </th>
                                        <th>
                                            color
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td>PERSON</td>
                                        <td>People, including fictional.</td>
                                        <td ><span style={{ backgroundColor: '#6c8c30' }} >#6c8c30</span></td>
                                    </tr>
                                    <tr>
                                        <td>NORP</td>
                                        <td>Nationalities or religious or political groups.</td>
                                        <td ><span style={{ backgroundColor: '#306c8c' }} >#306c8c</span></td>
                                    </tr>
                                    <tr>
                                        <td>FAC</td>
                                        <td>Buildings, airports, highways, bridges, etc.</td>
                                        <td ><span style={{ backgroundColor: '#736648' }} >#736648</span></td>
                                    </tr>
                                    <tr>
                                        <td>ORG</td>
                                        <td>Companies, agencies, institutions, etc.</td>
                                        <td><span style={{ backgroundColor: '#e79e3d' }} >#e79e3d</span></td>
                                    </tr>
                                    <tr>
                                        <td>GPE</td>
                                        <td>Countries, cities, states.</td>
                                        <td><span style={{ backgroundColor: '#47b0a5' }} >#47b0a5</span></td>
                                    </tr>
                                    <tr>
                                        <td>LOC</td>
                                        <td>Non-GPE locations, mountain ranges, bodies of water.</td>
                                        <td><span style={{ backgroundColor: '#940f15' }} >#940f15</span></td>
                                    </tr>
                                    <tr>
                                        <td>PRODUCT</td>
                                        <td>Objects, vehicles, foods, etc. (Not services.)</td>
                                        <td><span style={{ backgroundColor: '#ddcb93' }} >#ddcb93</span></td>
                                    </tr>
                                    <tr>
                                        <td>EVENT</td>
                                        <td>Named hurricanes, battles, wars, sports events, etc.</td>
                                        <td><span style={{ backgroundColor: '#a4b6c1' }} >#a4b6c1</span></td>
                                    </tr>
                                    <tr>
                                        <td>WORK_OF_ART</td>
                                        <td>Titles of books, songs, etc.</td>
                                        <td><span style={{ backgroundColor: '#2e598f' }} >#2e598f</span></td>
                                    </tr>
                                    <tr>
                                        <td>LAW</td>
                                        <td>Named documents made into laws.</td>
                                        <td><span style={{ backgroundColor: '#0c2141' }} >#0c2141</span></td>
                                    </tr>
                                    <tr>
                                        <td>LANGUAGE</td>
                                        <td>Any named language.</td>
                                        <td><span style={{ backgroundColor: '#4e5166' }} >#4e5166</span></td>
                                    </tr>
                                    <tr>
                                        <td>DATE</td>
                                        <td>Absolute or relative dates or periods.</td>
                                        <td><span style={{ backgroundColor: '#531253' }} >#531253</span></td>
                                    </tr>
                                    <tr>
                                        <td>TIME</td>
                                        <td>Times smaller than a day.</td>
                                        <td><span style={{ backgroundColor: '#cb48b7' }} >#cb48b7</span></td>
                                    </tr>
                                    <tr>
                                        <td>PERCENT</td>
                                        <td>Percentage, including ”%“.</td>
                                        <td><span style={{ backgroundColor: '#b7245c' }} >#b7245c</span></td>
                                    </tr>
                                    <tr>
                                        <td>MONEY</td>
                                        <td>Monetary values, including unit.</td>
                                        <td><span style={{ backgroundColor: '#b4869f' }} >#b4869f</span></td>
                                    </tr>
                                    <tr>
                                        <td>QUANTITY</td>
                                        <td>Measurements, as of weight or distance.</td>
                                        <td><span style={{ backgroundColor: '#855a5c' }} >#855a5c</span></td>
                                    </tr>
                                    <tr>
                                        <td>ORDINAL</td>
                                        <td>“first”, “second”, etc.</td>
                                        <td><span style={{ backgroundColor: '#db162f' }} >#db162f</span></td>
                                    </tr>
                                    <tr>
                                        <td>CARDINAL</td>
                                        <td>Numerals that do not fall under another type.</td>
                                        <td><span style={{ backgroundColor: '#c62e65' }} >#c62e65</span></td>
                                    </tr>
                                </tbody>

                            </Table>
                        </Card>
                    </Col>
                </Row>
            );
        }

    }
}

export default Ner;