import { TextAnnotator } from 'react-text-annotate'
import React from 'react'
import axios from 'axios'
import { API_BASE_URL, Card } from './Project'
import { Spinner, Button, Input } from 'reactstrap';







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

  componentDidMount() {

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
        <div>
          <Card>
            <Input type="select" onChange={this.handleTagChange} value={this.state.tag}>
              {this.state.POS.map((x) => <option >{x}</option>)};
            </Input>
            <TextAnnotator
              style={{
                fontFamily: 'IBM Plex Sans',
                maxWidth: 800,
                lineHeight: 2,
                fontSize: 20
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
            <Button outline color="info" onClick={this.validateLine} disabled={this.state.isLoading}>Validate POS</Button>{' '}
          </Card>
          <Card>
            <h4>Description</h4>
            <table class="table table-hover">
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
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </table>



            PUNC	punctuation
            JJ	adjective
            NNP	Proper noun, singular
            CC	Coordinating conjunction
            VBP	Verb, non-3rd person singular present
            VBD	Verb, past tense
            NNS	noun, plural
            RP	particle
            CD	Cardinal number
            WP	Wh-pronoun
            DT	determiner
            NOFUNC	withou function
            PRP	Personal pronoun
            RB	adverb
            VBN	verb, past participle
            UH	interjection
            WRB	Wh-adverb
            NNPS	Proper noun, plural
            VB	verb, base form
            VERB	verb, base form
          </Card>
        </div >

      );
    }

  }
}
export default Pos;
