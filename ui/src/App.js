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


class Pos extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      text: '',
      tag: '',
      value: {},
      colors: {},
      POS: [],
      project: 'jdid',
      isLoading: false
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

    axios.post(API_BASE_URL + 'project/pos/validate?project=' + this.state.project, {})
      .then((response) => {
        console.log(response.data);
        this.setState({
          isLoading: false
        });
      })
      .catch((err) => {
        this.setState({ isLoading: false });
      });
  }




  componentDidMount() {
    this.getPOS().then((res) => {

      this.setState({
        colors: res.data.colors,
        POS: res.data.item,
        tag: res.data.item[0]
      });
    })
    this.getText().then((res) => {
      this.setState({
        text: res.data
      });
      this.getValue(res.data).then((result) => {

        this.setState({
          value: result.data.value
        });
      });
    })

  }


  render() {

    return (
      <div>
        <Card>
          <select onChange={this.handleTagChange} value={this.state.tag}>
            {this.state.POS.map((x) => <option key={x}>{x}</option>)};
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
          <button onClick={this.validateLine} disabled={this.state.isLoading}> Validate POS </button>
        </Card>
        <Card>
          <h4>Current Value</h4>
          <pre>{JSON.stringify(this.state, null, 2)}</pre>
        </Card>
      </div>

    );
  }
}
export default Pos;