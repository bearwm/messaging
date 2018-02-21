import { Configurator } from '../../../lib/index';
import {
  Configurator as ReceiverConfigurator,
} from '../../../lib/configuration/ReceiverConfigurator';
import {
  Configurator as SenderConfigurator,
} from '../../../lib/configuration/SenderConfigurator';
import { expect } from 'chai';

describe('Configurator', () => {
  it('receiver: returns an instance of ReceiverConfigurator', () => {
    expect(Configurator.receiver()).to.be.instanceOf(ReceiverConfigurator);
  });

  it('receiver: creates new instance on every request', () => {
    expect(Configurator.receiver()).not.equals(Configurator.receiver());
  });

  it('sender: returns an instance of SenderConfigurator', () => {
    expect(Configurator.sender()).to.be.instanceOf(SenderConfigurator);
  });

  it('sender: creates new instance on every request', () => {
    expect(Configurator.sender()).not.equals(Configurator.sender());
  });
});
