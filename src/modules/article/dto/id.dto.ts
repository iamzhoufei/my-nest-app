import { IsNotEmpty, Matches } from 'class-validator';
import { regPositive } from 'src/utils';

export class IdDTO {
  @IsNotEmpty({ message: 'id不可为空' })
  @Matches(regPositive, { message: '请输入有效的id' })
  readonly id: number;
}
