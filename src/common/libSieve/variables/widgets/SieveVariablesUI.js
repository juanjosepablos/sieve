/*
 * The contents of this file are licensed. You may obtain a copy of
 * the license at https://github.com/thsmi/sieve/ or request it via
 * email from the author.
 *
 * Do not remove or change this comment.
 *
 * The initial author of the code is:
 *   Thomas Schmid <schmid-thomas@gmx.net>
 *
 */

/* global window */

(function () {

  "use strict";

  /* global $: false */
  /* global SieveStringListWidget */
  /* global SieveActionDialogBoxUI */
  /* global SieveTestDialogBoxUI */
  /* global SieveMatchTypeWidget */
  /* global SieveDesigner */
  /* global SieveComparatorWidget */

  const MAX_QUOTE_LEN = 240;
  const DOM_ELEMENT = 0;

  /**
   * Provides a ui for the set action
   */
  class SieveSetActionUI extends SieveActionDialogBoxUI {

    /**
     * @returns {SieveString}
     *   the element's name
     */
    name() {
      return this.getSieve().getElement("name");
    }

    /**
     * @returns {SieveString}
     *   the element's value
     */
    value() {
      return this.getSieve().getElement("value");
    }

    /**
     * @inheritDoc
     */
    getTemplate() {
      return "./variables/templates/SieveSetActionUI.html";
    }

    /**
     * @inheritDoc
     */
    onSave() {
      let item = $("#sivVariableName");

      if (! item.get(DOM_ELEMENT).checkValidity()) {
        return false;
      }

      this.name().value(item.val());
      this.value().value($("#sivVariableValue").val());

      let status;
      let value = null;

      status = $("input[type='checkbox'][name='10']").is(":checked");
      if (status)
        value = ":length";

      this.getSieve().getElement("modifier/10").setValue(value);
      this.getSieve().enable("modifier/10", status);

      value = null;
      status = $("input[type='checkbox'][name='20']").is(":checked");
      if (status)
        value = ":quotewildcard";

      this.getSieve().getElement("modifier/20").setValue(value);
      this.getSieve().enable("modifier/20", status);

      value = null;
      status = $("input[type='checkbox'][name='30']").is(":checked");
      if (status)
        value = $("input:radio[name='30']:checked").val();

      this.getSieve().getElement("modifier/30").setValue(value);
      this.getSieve().enable("modifier/30", status);

      value = null;
      status = $("input[type='checkbox'][name='40']").is(":checked");
      if (status)
        value = $("input:radio[name='40']:checked").val();

      this.getSieve().getElement("modifier/40").setValue(value);
      this.getSieve().enable("modifier/40", status);

      this.getSieve().toScript();

      return true;
    }

    /**
     * @inheritDoc
     */
    onLoad() {

      let state = null;

      state = this.getSieve().enable("modifier/10");
      $('input:checkbox[name="10"]').prop('checked', state);

      state = this.getSieve().enable("modifier/20");
      $('input:checkbox[name="20"]').prop('checked', state);

      state = this.getSieve().enable("modifier/30");
      $('input:checkbox[name="30"]')
        .change(function () { $('input:radio[name="30"]').prop('disabled', !($(this).prop('checked'))); })
        .prop('checked', state)
        .change();

      // if (item)
      //   $('input:radio[name="30"][value="'+ item.nodeName().substr(9)+'"]' ).prop('checked', true);

      state = this.getSieve().enable("modifier/40");
      $('input:checkbox[name="40"]')
        .change(function () { $('input:radio[name="40"]').prop('disabled', !($(this).prop('checked'))); })
        .prop('checked', state)
        .change();

      // if (item)
      //  $('input:radio[name="40"][value="'+ item.nodeName().substr(9)+'"]' ).prop('checked', true);

      $("#sivVariableName").val(this.name().value());
      $("#sivVariableValue").val(this.value().value());
    }

    /**
     * @inheritDoc
     */
    getSummary() {
      return $("<div/>")
        .html("Set variable <em>" + this.name() + "</em> to value " +
          "<div><em>" +
          $('<div/>').text(this.value().substr(0, MAX_QUOTE_LEN)).html() +
          ((this.value().substr().length > MAX_QUOTE_LEN) ? "..." : "") +
          "</em></div>");

    }
  }


  /**
   * Provides a ui for the sieve string test
   */
  class SieveStringTestUI extends SieveTestDialogBoxUI {

    /**
     * @returns {SieveStringList}
     *   the element's keys
     */
    keys() {
      return this.getSieve().getElement("keys");
    }

    /**
     * @returns {SieveStringList}
     *   the element's sources
     */
    sources() {
      return this.getSieve().getElement("sources");
    }

    /**
     * @returns {SieveAbstractElement}
     *   the element's matchtype
     */
    matchtype() {
      return this.getSieve().getElement("match-type");
    }

    /**
     * @returns {SieveAbstractElement}
     *   the element's comparator
     */
    comparator() {
      return this.getSieve().getElement("comparator");
    }

    /**
     * @inheritDoc
     */
    getTemplate() {
      return "./variables/templates/SieveStringTestUI.html";
    }

    /**
     * @inheritDoc
     */
    onSave() {

      (new SieveStringListWidget("#sivVariablesSourceList"))
        .save(this.sources());
      (new SieveStringListWidget("#sivVariablesKeyList"))
        .save(this.keys());

      (new SieveMatchTypeWidget("#sivVariablesMatchTypes"))
        .save(this.matchtype());
      (new SieveComparatorWidget("#sivVariablesComparator"))
        .save(this.comparator());

      return true;
    }

    /**
     * @inheritDoc
     */
    onLoad() {

      (new SieveStringListWidget("#sivVariablesSourceList"))
        .init(this.sources());
      (new SieveStringListWidget("#sivVariablesKeyList"))
        .init(this.keys());

      (new SieveMatchTypeWidget("#sivVariablesMatchTypes"))
        .init(this.matchtype());
      (new SieveComparatorWidget("#sivVariablesComparator"))
        .init(this.comparator());
    }

    /**
     * @inheritDoc
     */
    getSummary() {
      return $("<div/>")
        .html(" string " + $('<em/>').text(this.sources().values()).html()
          + " " + this.matchtype().getValue()
          + " " + $('<em/>').text(this.keys().values()).html());

    }
  }

  if (!SieveDesigner)
    throw new Error("Could not register Body Extension");

  SieveDesigner.register("action/set", SieveSetActionUI);
  SieveDesigner.register("test/string", SieveStringTestUI);

})(window);
