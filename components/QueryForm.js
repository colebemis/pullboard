import { withRouter } from 'next/router'
import { func, shape, string } from 'prop-types'
import { stringify } from 'query-string'
import React, { Component } from 'react'
import Flex from './Flex'
import Input from './Input'

export class QueryForm extends Component {
  static propTypes = {
    router: shape({
      query: shape({
        query: string,
      }).isRequired,
      push: func.isRequired,
    }).isRequired,
  }

  state = {
    query: this.props.router.query.query,
  }

  componentDidUpdate(prevProps) {
    if (this.props.router.query.query !== prevProps.router.query.query) {
      this.setState({ query: this.props.router.query.query })
    }
  }

  handleChange = event => {
    this.setState({ query: event.target.value })
  }

  handleSubmit = event => {
    event.preventDefault()

    const { router } = this.props
    const { query } = this.state

    if (query !== router.query.query) {
      router.push(`/?${stringify({ ...router.query, query })}`)
    }
  }

  render() {
    const { router } = this.props
    const { query } = this.state

    return (
      <form onSubmit={this.handleSubmit}>
        <Flex>
          <Input
            type="text"
            aria-label="Query"
            spellCheck={false}
            value={query || ''}
            onChange={this.handleChange}
            color="gray.9"
          />
          {query !== router.query.query ? <button>Apply</button> : null}
        </Flex>
      </form>
    )
  }
}

export default withRouter(QueryForm)
