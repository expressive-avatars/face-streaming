import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Switch, Link, Route } from 'react-router-dom'
import { Ios } from './components/iOS'
import { Desktop } from './components/Desktop'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/" exact>
          <ul>
            <Link to="/ios">
              <li>iOS</li>
            </Link>
            <Link to="/desktop">
              <li>Desktop</li>
            </Link>
          </ul>
        </Route>
        <Route path="/desktop">
          <Desktop />
        </Route>
        <Route path="/ios">
          <Ios />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
