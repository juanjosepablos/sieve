/*
 * The content of this file is licensed. You may obtain a copy of
 * the license at https://github.com/thsmi/sieve/ or request it via
 * email from the author.
 *
 * Do not remove or change this comment.
 *
 * The initial author of the code is:
 *   Thomas Schmid <schmid-thomas@gmx.net>
 */

const ONCE = 1;

/**
 * A simplistic mocking framework.
 */
class Mock {

  /**
   * Adds a new mocked function to the mock object.
   *
   * @param {object} mock
   *   the mock object to which the new functions should be added.
   * @param {string} name
   *   the new methods name.
   * @param {any} [result]
   *   the result to be returned when the mocked function is called.
   *   if omitted the mock will return undefined.
   */
  returns(mock, name, result) {
    mock[`##${name}`] = 0;
    mock[name] = function() {
      mock[`##${name}`]++;
      return result;
    };
  }

  /**
   * Defines an argument list used in the expect method.
   *
   * @param  {...any} expected
   *   the arguments which are expected on the call.
   *
   * @returns {boolean}
   *   true in case the arguments match.
   */
  arguments(...expected) {
    return function(...args) {

      if (args.length !== expected.length)
        throw new Error(`Expected ${expected.length} arguments but got ${args.length}`);

      if (!args.every((value, index) => { return value === expected[index]; }))
        throw new Error(`Expected arguments ${expected} arguments but got ${args}`);

      return true;
    };
  }

  /**
   * Adds a hook to the callback method which checks if it is called with the
   * correct arguments. The check is performed by the callback method.
   *
   * @param {object} mock
   *   the mock object.
   * @param {string} name
   *   the mock methods name.
   * @param {Function} expected
   *   a callback function which is used to check if the arguments are matching.
   */
  expects(mock, name, expected) {
    if (!mock[name])
      mock[name] = this.returns(mock, name);

    const old = mock[name];
    mock[name] = (...args) => {
      if (!expected(...args))
        throw new Error("Got unexpected arguments.");

      return old(...args);
    };
  }

  /**
   * Checks if a mocked method was invoked for the given number of times.
   *
   * @param {object} mock
   *   the mock object.
   * @param {string} name
   *   the mock methods name.
   * @param {number} [times]
   *   the expected number of calls.
   */
  verify(mock, name, times) {
    if (typeof (times) === "undefined" || times === null)
      times = ONCE;

    const count = mock[`##${name}`];

    if (count === undefined)
      throw new Error(`Method ${name} never called`);

    if (count !== times)
      throw new Error(`Expected ${times} calls to ${name} but got ${times}`);
  }
}


/**
 * Implements a facade which allows the sandbox to test fixture
 * to be controlled from outside the sandbox
 */
class AbstractSandboxedTestFixture {

  /**
   * Creates a new sand boxed fixture.
   */
  constructor() {
    this.tests = new Map();
    this.signal("Ready");

    this.mock = new Mock();
  }

  /**
   * Send a signal to the sandbox owner.
   *
   * @param {string} type
   *   the message type
   * @param {object} data
   *   the data to be send
   */
  send(type, data) {
    throw new Error(`Implement send(${type}, ${data})`);
  }

  /**
   * Send a signal to the sandbox owner.
   *
   * @param {string} type
   *   the signal's message type
   * @param {object} data
   *   the data to be send
   */
  signal(type, data = {}) {
    this.send(`${type}Signal`, data);
  }

  /**
   * Sends a response message to the sandbox owner.
   *
   * @param {string} type
   *   the response messages type.
   * @param {object} data
   *   the data to be send
   */
  response(type, data) {
    this.send(`${type}Resolve`, data);
  }

  /**
   * Sends an error response to the sandbox owner.
   *
   * @param {string} type
   *   the error messages type.
   * @param {object} data
   *   the data to be send
   */
  error(type, data) {
    this.send(`${type}Reject`, data);
  }

  /**
   * Sets a description for this test fixture.
   *
   * @param {string|string[]} lines
   *   the description which should be echoed.
   */
  description(lines) {
    if (!Array.isArray(lines))
      lines = [lines];

    for (const line of lines)
      this.log(line);
  }

  /**
   * Logs a generic log message
   *
   * @param {string} message
   *   the log message
   * @param {string} level
   *   the log level
   */
  log(message, level) {
    this.signal("Log", { message: message, level: level });
  }

  /**
   * Logs the string at trace level
   *
   * @param {string} message
   *   the message to log.
   */
  logTrace(message) {
    this.log(message, "Trace");
  }

  /**
   * Returns a list with all registered test names.
   *
   * @returns {string[]}
   *   a string list with the test case names
   */
  get() {
    return this.tests.keys();
  }

  /**
   * Runs the test case
   *
   * @param {string} [name]
   *   the test case name, if omitted all test cases are run.
   */
  async run(name) {

    if (!this.tests.has(name))
      throw new Error(`No test ${name}`);

    await (this.tests.get(name))(this);
  }

  /**
   * Registers a function which contains a test to run.
   * @param {string} name
   *   the test case name.
   * @param {*} test
   *   the function to call which contains the test.
   *
   */
  add(name, test) {
    this.tests.set(name, test);
  }

  /**
   * Checks if the actual value is NaN
   *
   * @param {*} actual
   *   the value which should be tested.
   * @param {string} [message]
   *   the optimal message in case of a failure
   */
  assertNaN(actual, message) {
    this.assertTrue(isNaN(actual), message);
  }

  /**
   * Checks if the actual value is equal to null
   *
   * @param {*} actual
   *   the actual value which should be tested.
   * @param {string} [message]
   *   the optional message to display in case of a failure.
   */
  assertNull(actual, message) {
    this.assertEquals(null, actual, message);
  }

  /**
   * Checks if the actual value is equal to true.
   *
   * @param {boolean} actual
   *   the actual value which should be tested
   * @param {string} [message]
   *   the optional message to display in case of a failure.
   *
   */
  assertTrue(actual, message) {
    this.assertEquals(true, actual, message);
  }

  /**
   * Checks if the function call throws the given exception.
   *
   * @param {Function} closure
   *   the closure which contains the function call to be tested.
   * @param {string} exception
   *   the expected exception's message text.
   */
  assertThrows(closure, exception) {
    try {
      closure();
    }
    catch (e) {
      this.logTrace("Exception caught");
      this.assertEquals(exception, e.toString().substr(0, exception.length));

      return;
    }

    this.fail(`Call did not throw exception ${exception}`);
  }

  /**
   * Checks if the actual value is a equals to false.
   *
   * @param {boolean} actual
   *   the actual value which should be tested
   * @param {string} [message]
   *   the optional message to display in case of a failure.
   *
   */
  assertFalse(actual, message) {
    this.assertEquals(false, actual, message);
  }

  /**
   * Checks if the given array matches the expectation.
   * It is a binary byte wise comparison.
   *
   * @param {Uint8Array|string} expected
   *  the expected array. In case of a string it will be encoded.
   * @param {Uint8Array|string} actual
   *   the array which should be tested. In case of a string it will be encoded.
   * @param {string} [message]
   *   the optional message to display in case of a failure
   */
  assertArrayEquals(expected, actual, message) {
    if (!(expected instanceof Uint8Array))
      expected = (new TextEncoder()).encode(expected);

    if (!(actual instanceof Uint8Array))
      actual = (new TextEncoder()).encode(actual);

    this.assertEquals(expected.toString(), actual.toString(), message);
  }


  /**
   * Checks if the actual value matches the expectation.
   * In case it does not it throws an exception.
   *
   * @param {any} expected
   *   the expected value
   * @param {any} actual
   *   the actual value which should be tested
   * @param {string} [message]
   *   the message to display in case of a failure
   *
   */
  assertEquals(expected, actual, message) {

    if (expected === actual) {
      this.logTrace(`Assert successful: ${expected}\n`);
      return;
    }

    if (typeof (message) === 'undefined' || message === null) {

      if (expected === null)
        message = `Assert failed\nExpected null`;
      else
        message = `Assert failed\nExpected (${expected.length} Bytes): \n${expected}\n\n`;

      message += `But got (${actual.length} Bytes)\n${actual}`;
    }

    this.fail(`${message}`);
  }

  /**
   * Makes the test fail.
   *
   * @param {string} message
   *   the message which is shown to the user. It should describe the error.
   */
  fail(message) {
    throw new Error(`${message}`);
  }

  /**
   * Dispatches the incoming ipc message to the handler and
   * returns the result.
   *
   * It will also signal exceptions to the sender.
   *
   * @param {string} type
   *   the message type as string
   * @param {Function} handler
   *   the message handler which is used to process the message.
   */
  async dispatchMessage(type, handler) {

    try {
      const result = await handler();
      this.response(type, result);
    } catch (ex) {
      this.error(type, { message: ex.message, stack: ex.stack} );
    }
  }

  /**
   * Called when a new ipc message arrives.
   *
   * @param {string} msg
   *   the event for the ipc message
   */
  onMessage(msg) {

    msg = JSON.parse(msg);

    if (msg.type === "Ready") {
      this.signal("ReadySignal");
      return;
    }

    if (msg.type === "ImportScript") {
      this.dispatchMessage(msg.type, async () => { return await this.require(msg.payload); });
      return;
    }

    if (msg.type === "GetTests") {
      this.dispatchMessage(msg.type, async () => {
        return [...await this.get()];
      });
      return;
    }

    if (msg.type === "RunTest") {
      this.dispatchMessage(msg.type, async () => { return await this.run(msg.payload); });
      return;
    }
  }

}

export {
  AbstractSandboxedTestFixture
};
