export class CircuitBreaker {
  constructor({ failureThreshold = 3, cooldownMs = 5000 } = {}) {
    this.failureThreshold = failureThreshold
    this.cooldownMs = cooldownMs
    this.state = 'closed'
    this.failures = 0
    this.nextTryAt = 0
  }

  canRequest() {
    if (this.state === 'open') {
      if (Date.now() >= this.nextTryAt) {
        this.state = 'half-open'
        return true
      }
      return false
    }
    return true
  }

  recordSuccess() {
    this.failures = 0
    this.state = 'closed'
  }

  recordFailure() {
    this.failures += 1
    if (this.failures >= this.failureThreshold) {
      this.state = 'open'
      this.nextTryAt = Date.now() + this.cooldownMs
    }
  }
}


