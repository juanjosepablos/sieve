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

import { SieveGrammar } from "./../../../toolkit/logic/GenericElements.mjs";

import {
  parameters, stringListField, stringField,
  tags, tag, id, token
} from "../../../toolkit/logic/SieveGrammarHelper.mjs";

// fileinto [:create] <mailbox: string>

SieveGrammar.addTag(
  id("action/fileinto/create", "@action/fileinto/", "mailbox"),
  token(":create"));

const fileinto = {
  extends: "action/fileinto",

  properties: [
    tags(
      tag("create", "action/fileinto/create", "mailbox"))
  ]
};

SieveGrammar.extendAction(fileinto);


// mailboxexists <mailbox-names: string-list>

SieveGrammar.addTest(
  id("test/mailboxexists", "@test", "mailbox"),

  token("mailboxexists"),
  parameters(
    stringListField("mailboxes", "INBOX"))
);

// metadataexists <mailbox: string> <annotation-names: string-list>

SieveGrammar.addTest(
  id("test/metadataexists", "@test", "mboxmetadata"),

  token("metadataexists"),
  parameters(
    stringField("mailbox", "INBOX"),
    stringListField("annotations"))
);

// metadata [MATCH-TYPE] [COMPARATOR]
//         <mailbox: string>
//         <annotation-name: string> <key-list: string-list>

/**
 * Retrieves the value of the mailbox annotation "annotation-name" for mailbox
 * "mailbox#". The retrieved value is compared against the key-list.
 *
 * The test returns true if the annotation exists and its value matches and of
 * the keys.
 *
 * The default matchtype is :is and the default comparator is "i;ascii-casemap"
 */

SieveGrammar.addTest(
  id("test/metadata", "@test", "mboxmetadata"),

  token("metadata"),
  tags(
    tag("match-type"),
    tag("comparator")),
  parameters(
    stringField("mailbox", "INBOX"),
    stringField("annotation"),
    stringListField('keys')
  ));

// servermetadataexists <annotation-names: string-list>

SieveGrammar.addTest(
  id("test/servermetadataexists", "@test", "servermetadata"),

  token("servermetadataexists"),
  parameters(
    stringListField("annotations")));


// servermetadata [MATCH-TYPE] [COMPARATOR] <annotation-name: string> <key-list: string-list>
SieveGrammar.addTest(
  id("test/servermetadata", "@test", "servermetadata"),

  token("servermetadata"),
  tags(
    tag("match-type"),
    tag("comparator")),
  parameters(
    stringField("annotation"),
    stringListField("keys")
  ));
