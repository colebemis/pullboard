import { withRouter } from 'next/router'
import { func, shape, string } from 'prop-types'
import React, { Component } from 'react'
import { loggedIn } from '../lib/auth'
import { getGithubAuthUrl } from '../lib/github'
import { redirect } from '../lib/utils'

class LoginPage extends Component {
  static propTypes = {
    router: shape({
      push: func.isRequired,
      query: shape({
        from: string,
      }).isRequired,
    }).isRequired,
  }

  static getInitialProps({ req, res, query }) {
    if (loggedIn(req)) {
      redirect(query.from || '/', res)
    }

    return {}
  }

  render() {
    const { router } = this.props

    return (
      <div>
        <h1>Welcome to PullBoard</h1>
        <button
          onClick={() => router.push(getGithubAuthUrl(router.query.from))}
        >
          Continue with GitHub
        </button>
      </div>
    )
  }
}

export default withRouter(LoginPage)
