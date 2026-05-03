import { IsNotEmpty, IsString, IsISO8601, IsOptional, IsNumber, IsIn, MaxLength, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBookingDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(300)
    @Transform(({ value }) => value?.trim())
    from: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(300)
    @Transform(({ value }) => value?.trim())
    to: string;

    @IsISO8601()
    @IsNotEmpty()
    pickupTime: string;

    @IsString()
    @IsOptional()
    @IsIn(['smart', 'comfort', 'business', 'group', 'van', 'executive', 'vip'])
    category?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    flightNumber?: string;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(20)
    passengers?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(20)
    luggage?: number;

    @IsString()
    @IsOptional()
    @IsIn(['oneway', 'roundtrip'])
    tripType?: string;
}

export class UpdateBookingStatusDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['PENDING', 'CONFIRMED', 'ON_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    status: string;

    @IsString()
    @IsOptional()
    @MaxLength(6)
    pin?: string;
}
