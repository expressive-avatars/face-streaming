import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Switch, Link, Route } from 'react-router-dom'
import { Sender } from './routes/Sender'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/" exact>
          <ul>
            <Link to="/sender">
              <li>Sender</li>
            </Link>
            <Link to="/receiver">
              <li>Receiver</li>
            </Link>
          </ul>
        </Route>
        <Route path="/receiver"></Route>
        <Route path="/sender">
          <Sender />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
