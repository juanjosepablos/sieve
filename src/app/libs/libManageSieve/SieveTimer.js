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


(function (exports) {

  "use strict";

  const { SieveAbstractTimer } = require("./SieveAbstractTimer.js");

  const timers = require('timers');

  /**
   * By default node does not inject a timer into the standard context.
   *
   * Your need to include it via require. All in all it is almost identical
   * with the timer used by a javascript window object. But it lives in a
   * different namespace.
   */
  class SieveNodeTimer extends SieveAbstractTimer {

    /**
     * @inheritdoc
     */
    start(callback, ms) {
      this.cancel();

      if (ms === 0)
        return;

      this.timer = timers.setTimeout(callback, ms);
    }

    /**
     * @inheritdoc
     */
    cancel() {
      if (!this.timer)
        return;

      timers.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  exports.SieveTimer = SieveNodeTimer;

})(this);
