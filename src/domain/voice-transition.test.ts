import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyVoiceTransition,
  shouldSendFirstEntryAlert,
} from "./voice-transition.js";

const monitoredChannelId = "monitorado";

describe("classifyVoiceTransition", () => {
  it("detecta uma conexão direta no canal monitorado", () => {
    assert.equal(
      classifyVoiceTransition(null, monitoredChannelId, monitoredChannelId),
      "entered",
    );
  });

  it("detecta uma mudança de outro canal para o monitorado", () => {
    assert.equal(
      classifyVoiceTransition("outro", monitoredChannelId, monitoredChannelId),
      "entered",
    );
  });

  it("detecta uma desconexão do canal monitorado", () => {
    assert.equal(
      classifyVoiceTransition(monitoredChannelId, null, monitoredChannelId),
      "left",
    );
  });

  it("detecta uma mudança do canal monitorado para outro", () => {
    assert.equal(
      classifyVoiceTransition(monitoredChannelId, "outro", monitoredChannelId),
      "left",
    );
  });

  it("ignora alterações de estado dentro do mesmo canal", () => {
    assert.equal(
      classifyVoiceTransition(
        monitoredChannelId,
        monitoredChannelId,
        monitoredChannelId,
      ),
      null,
    );
  });

  it("ignora movimentações que não envolvem o canal monitorado", () => {
    assert.equal(
      classifyVoiceTransition("canal-a", "canal-b", monitoredChannelId),
      null,
    );
  });
});

describe("shouldSendFirstEntryAlert", () => {
  it("avisa quando a primeira pessoa entra", () => {
    assert.equal(shouldSendFirstEntryAlert("entered", 1), true);
  });

  it("não avisa nas entradas seguintes", () => {
    assert.equal(shouldSendFirstEntryAlert("entered", 2), false);
  });

  it("não avisa em eventos de saída", () => {
    assert.equal(shouldSendFirstEntryAlert("left", 1), false);
  });
});
