import { ApiProperty } from '@nestjs/swagger';
import { AudioType } from '../../../common-clevertube/constants/global.constant';
import {
  IsValidText,
  IsValidEnum,
  IsValidNumber,
  IsValidArrayString,
} from '../../../common-clevertube/decorators/custom-validator.decorator';

import { getValEnumStr } from '../../../common-clevertube/utils';

export class CreateAudioDto {
  @ApiProperty({ required: true })
  @IsValidText()
  audioCode: string;

  @ApiProperty({ enum: getValEnumStr(AudioType), required: true })
  @IsValidEnum({ enum: AudioType })
  audioTypeKey: string;

  @ApiProperty()
  @IsValidText()
  title: string;

  @ApiProperty()
  @IsValidText()
  desc: string;

  @ApiProperty()
  @IsValidNumber({ required: true })
  fileId: number;

  @ApiProperty()
  @IsValidNumber({ required: true })
  audioThumbnailId: number;

  @ApiProperty()
  @IsValidArrayString({ required: true, unique: true })
  topicKeys: string[];

  @ApiProperty()
  @IsValidText({ required: true })
  levelKey: string;
}
