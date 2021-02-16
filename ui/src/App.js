import React from 'react'
import axios from 'axios'
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap'

import { BrowserRouter as Router, NavLink as JMXNavLink, Link, Route, Switch } from 'react-router-dom'

import CreateProjectForm, { API_BASE_URL, CreateLabelForm } from './Project'
import Pos from './Pos'
import Ner from './Ner'
import Label from './Label'


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            route: 'createnewproject',
            currentProject: '',
            allProject: [],
            err: null,
            isOpen: false
        };

        this.handle = this.handle.bind(this);
    }

    createSelectProject() {
        axios.get(API_BASE_URL + 'PROJECTS').then((res) => {
            this.setState({
                allProject: res.data
            });
        }).catch((err) => {
            this.setState({
                err: err.message
            });
        });
    }

    handle() {
        this.createSelectProject();
    }

    handleChangeMenu = e => {
        e.preventDefault();
    }


    toggle = e => {
        e.preventDefault();
        this.setState((state) => ({
            isOpen: !state.isOpen
        }));
    }

    componentDidMount() {
        this.createSelectProject();
    }

    render() {
        if (this.state.err) {
            return (
                <div>
                    <h4 className="text-danger">Error was found : {this.state.err}</h4>
                </div>
            );
        } else {
            return (
                <Router>
                    <Navbar color="light" light expand="md" role='navigation'>
                        <NavbarBrand tag={Link} to='/'>NLP Tools</NavbarBrand>
                        <NavbarToggler onClick={this.toggle} />
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="mr-auto" navbar>
                                <NavItem>
                                    <NavLink tag={JMXNavLink} exact to="/createproject" >Create New Project</NavLink>
                                </NavItem>
                                <UncontrolledDropdown nav inNavbar>
                                    <DropdownToggle nav caret>
                                        Select Project
                                    </DropdownToggle>
                                    <DropdownMenu right>

                                        {this.state.allProject.map((project) =>
                                            <DropdownItem>
                                                <NavItem>
                                                    <NavLink tag={JMXNavLink} exact to={'/project/' + project[1] + '/' + project[0]} >{project[0]} ({project[1]}) </NavLink>
                                                </NavItem>
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </Nav>
                        </Collapse>
                    </Navbar>

                    <Switch>
                        <Route exact path="/">
                            <CreateProjectForm />
                        </Route>
                        <Route path="/createproject">
                            <CreateProjectForm handle={this.handle} />
                        </Route>
                        {this.state.allProject.map((project) =>
                            <Route path={'/project/' + project[1] + '/' + project[0]} key={project[0].toString()}>
                                {
                                    project[1] == 'NER' &&
                                    <Ner project={project[0]} />

                                }

                                {
                                    project[1] == 'POS' &&
                                    <Pos project={project[0]} />
                                }

                                {
                                    project[1] == 'LABEL' &&
                                    <Label project={project[0]} />
                                }
                            </Route>
                        )}
                    </Switch>
                </Router>
            );
        }
    }

}



export default App;
