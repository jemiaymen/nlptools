import { TextAnnotator } from 'react-text-annotate'
import React from 'react'
import axios from 'axios'
import { API_BASE_URL, Card, Download } from './Project'
import { Spinner, Button, Input, Table, Row, Col } from 'reactstrap';







class Pos extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      text: '',
      tag: '',
      value: {},
      colors: {},
      POS: [],
      project: props.project,
      isLoading: false,
      err: null,
      isDone: false
    };


  }

  getPOS() {
    return axios.get(API_BASE_URL + 'POS');
  }

  getText() {
    return axios.get(API_BASE_URL + 'project/' + this.state.project + '/pos/next');
  }

  getValue(line) {
    return axios.get(API_BASE_URL + 'POS/line?line=' + line);
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


    axios.post(API_BASE_URL + 'POS/tags', { data: this.state.value }).then((d) => {
      axios.post(API_BASE_URL + 'project/pos/validate?project=' + this.state.project, {})
        .then((response) => {
          this.setState({ isLoading: true });

          this.getPOS().then((res) => {

            this.setState({
              colors: res.data.colors,
              POS: res.data.item
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

  updatePos() {
    this.setState({ isLoading: true });

    this.getPOS().then((res) => {

      this.setState({
        colors: res.data.colors,
        POS: res.data.item,
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
    this.updatePos();
  }

  getSnapshotBeforeUpdate(prevProps) {
    return { updateRequired: prevProps.project !== this.props.project };
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    const newproject = this.props.project;
    if (snapshot.updateRequired) {
      this.setState({ project: newproject, isDone: false });
      this.updatePos();
    }
  }

  render() {

    if (this.state.isDone) {
      return (
        <div>
          <h3 className="text-info">
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
          <Spinner color="info" />
        </div>
      );
    } else {
      return (
        <Row>
          <Col >
            <Card>
              <Input type="select" onChange={this.handleTagChange} value={this.state.tag}>
                {this.state.POS.map((x) => <option key={x.toString()}>{x}</option>)};
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
              <Button outline color="info" onClick={this.validateLine} >Validate POS</Button>{' '}
            </Card>
            <Card>
              <Download type='pos' project={this.state.project} />
            </Card>
          </Col>
          <Col >
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
                    <td>NOUN</td>
                    <td>noun, singular or mass</td>
                    <td ><span style={{ backgroundColor: '#6c8c30' }} >#6c8c30</span></td>
                  </tr>
                  <tr>
                    <td>IN</td>
                    <td>Preposition or subordinating conjunction</td>
                    <td ><span style={{ backgroundColor: '#306c8c' }} >#306c8c</span></td>
                  </tr>
                  <tr>
                    <td>PUNC</td>
                    <td>punctuation</td>
                    <td ><span style={{ backgroundColor: '#736648' }} >#736648</span></td>
                  </tr>
                  <tr>
                    <td>JJ</td>
                    <td>adjective</td>
                    <td><span style={{ backgroundColor: '#e79e3d' }} >#e79e3d</span></td>
                  </tr>
                  <tr>
                    <td>NNP</td>
                    <td>Proper noun, singular</td>
                    <td><span style={{ backgroundColor: '#47b0a5' }} >#47b0a5</span></td>
                  </tr>
                  <tr>
                    <td>CC</td>
                    <td>Coordinating conjunction</td>
                    <td><span style={{ backgroundColor: '#940f15' }} >#940f15</span></td>
                  </tr>
                  <tr>
                    <td>VBP</td>
                    <td>Verb, non-3rd person singular present</td>
                    <td><span style={{ backgroundColor: '#ddcb93' }} >#ddcb93</span></td>
                  </tr>
                  <tr>
                    <td>VBD</td>
                    <td>Verb, past tense</td>
                    <td><span style={{ backgroundColor: '#a4b6c1' }} >#a4b6c1</span></td>
                  </tr>
                  <tr>
                    <td>NNS</td>
                    <td>noun, plural</td>
                    <td><span style={{ backgroundColor: '#2e598f' }} >#2e598f</span></td>
                  </tr>
                  <tr>
                    <td>RP</td>
                    <td>particle</td>
                    <td><span style={{ backgroundColor: '#0c2141' }} >#0c2141</span></td>
                  </tr>
                  <tr>
                    <td>CD</td>
                    <td>Cardinal number</td>
                    <td><span style={{ backgroundColor: '#4e5166' }} >#4e5166</span></td>
                  </tr>
                  <tr>
                    <td>WP</td>
                    <td>Wh-pronoun</td>
                    <td><span style={{ backgroundColor: '#531253' }} >#531253</span></td>
                  </tr>
                  <tr>
                    <td>DT</td>
                    <td>determiner</td>
                    <td><span style={{ backgroundColor: '#cb48b7' }} >#cb48b7</span></td>
                  </tr>
                  <tr>
                    <td>NOFUNC</td>
                    <td>withou function</td>
                    <td><span style={{ backgroundColor: '#b7245c' }} >#b7245c</span></td>
                  </tr>
                  <tr>
                    <td>PRP</td>
                    <td>Personal pronoun</td>
                    <td><span style={{ backgroundColor: '#b4869f' }} >#b4869f</span></td>
                  </tr>
                  <tr>
                    <td>RB</td>
                    <td>adverb</td>
                    <td><span style={{ backgroundColor: '#855a5c' }} >#855a5c</span></td>
                  </tr>
                  <tr>
                    <td>VBN</td>
                    <td>verb, past participle</td>
                    <td><span style={{ backgroundColor: '#db162f' }} >#db162f</span></td>
                  </tr>
                  <tr>
                    <td>UH</td>
                    <td>interjection</td>
                    <td><span style={{ backgroundColor: '#c62e65' }} >#c62e65</span></td>
                  </tr>
                  <tr>
                    <td>WRB</td>
                    <td>Wh-adverb</td>
                    <td><span style={{ backgroundColor: '#dec5e3' }} >#dec5e3</span></td>
                  </tr>
                  <tr>
                    <td>NNPS</td>
                    <td>Proper noun, plural</td>
                    <td><span style={{ backgroundColor: '#b75d69' }} >#b75d69</span></td>
                  </tr>
                  <tr>
                    <td>VERB</td>
                    <td>verb, base form</td>
                    <td><span style={{ backgroundColor: '#b9c6ae' }} >#b9c6ae</span></td>
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
export default Pos;
