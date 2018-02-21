import {
  FluentConfigurator as ReceiverConfigurator,
  Configurator as ReceiverConfImpl,
} from './ReceiverConfigurator';

import {
  FluentConfigurator as SenderConfigurator,
  Configurator as SenderConfImpl,
} from './SenderConfigurator';

export default class Configurator {
  static receiver(): ReceiverConfigurator {
    return new ReceiverConfImpl();
  }

  static sender(): SenderConfigurator {
    return new SenderConfImpl();
  }
}
