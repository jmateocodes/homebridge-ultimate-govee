import {Inject, Injectable} from '@nestjs/common';
import {Emitter} from '../../util/types';
import {EventEmitter2, OnEvent} from '@nestjs/event-emitter';
import {PlatformAccessory} from 'homebridge';
import {GoveeDevice} from '../../devices/GoveeDevice';
import {Logging} from 'homebridge/lib/logger';
import {PLATFORM_ACCESSORY_FACTORY, PLATFORM_LOGGER, PLATFORM_UUID_GENERATOR} from '../../util/const';
import {BinaryLike} from 'crypto';
import {InformationService} from './services/InformationService';
import {HumidifierService} from './services/HumidifierService';
import {PurifierService} from './services/PurifierService';

@Injectable()
export class AccessoryManager extends Emitter {
  private readonly accessories: Map<string, PlatformAccessory> = new Map<string, PlatformAccessory>();

  constructor(
    eventEmitter: EventEmitter2,
    private readonly informationService: InformationService,
    private readonly humidifierService: HumidifierService,
    private readonly purifierService: PurifierService,
    @Inject(PLATFORM_LOGGER) private readonly log: Logging,
    @Inject(PLATFORM_ACCESSORY_FACTORY) private readonly accessoryFactory: typeof PlatformAccessory,
    @Inject(PLATFORM_UUID_GENERATOR) private readonly generateUUID: (data: BinaryLike) => string,
  ) {
    super(eventEmitter);
  }

  @OnEvent(
    'DEVICE.Discovered',
    {
      async: true,
    },
  )

  onDeviceDiscovered(device: GoveeDevice) {
    const deviceUUID = this.generateUUID(device.deviceId);
    this.log.info('DISCOVERED', device.deviceId, deviceUUID);
    if (this.accessories.has(deviceUUID)) {
      return;
    }
    const accessory = new this.accessoryFactory(
      device.name,
      deviceUUID,
    );
    this.informationService.initializeAccessory(accessory, device);
    this.humidifierService.initializeAccessory(accessory, device);
    this.purifierService.initializeAccessory(accessory, device);
    this.accessories.set(
      deviceUUID,
      accessory,
    );
  }

  @OnEvent(
    'DEVICE.Updated',
    {
      async: true,
    },
  )
  onDeviceUpdated(device: GoveeDevice) {
    const deviceUUID = this.generateUUID(device.deviceId);
    this.log.info('UPDATED', device.deviceId, deviceUUID);
    if (!this.accessories.has(deviceUUID)) {
      return;
    }
    const accessory = this.accessories.get(deviceUUID);
    if (!accessory) {
      return;
    }
    this.informationService.updateAccessory(accessory, device);
    this.humidifierService.updateAccessory(accessory, device);
    this.purifierService.updateAccessory(accessory, device);
  }
}