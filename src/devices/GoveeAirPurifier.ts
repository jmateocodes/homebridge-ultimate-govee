import {DeviceConfig} from '../core/structures/devices/DeviceConfig';
import {OnOff} from './states/OnOff';
import {FanSpeed} from './states/FanSpeed';
import {Active} from './states/Active';
import {Timer} from './states/Timer';
import {DeviceState} from '../core/structures/devices/DeviceState';
import {Provider} from '@nestjs/common/interfaces/modules/provider.interface';
import {GoveeDevice} from './GoveeDevice';
import {StatusMode} from './states/StatusMode';

export const purifierProviders: Provider[] = [
  {
    provide: 'H7121',
    useValue: function() {
      return (config) => new GoveeAirPurifier(config);
    },
  },
  {
    provide: 'H7122',
    useValue: function() {
      return (config) => new GoveeAirPurifier(config);
    },
  },
];

export class GoveeAirPurifier
  extends StatusMode(FanSpeed(Timer(Active(OnOff(GoveeDevice))))) {

  constructor(
    deviceConfig: DeviceConfig,
  ) {
    super(deviceConfig);
  }
}