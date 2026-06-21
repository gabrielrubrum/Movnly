import { IsNotEmpty, IsString, IsOptional, IsNumber, IsIn, MaxLength, Min, Max, IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePartnerBookingDto {
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
    @IsNotEmpty()
    @MaxLength(120)
    guestName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    guestEmail: string;

    @IsString()
    @IsOptional()
    @MaxLength(30)
    guestPhone?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    notes?: string;
}

export class UpdatePartnerProfileDto {
    @IsString()
    @IsOptional()
    @MaxLength(200)
    organization?: string;

    @IsString()
    @IsOptional()
    @IsIn(['hotel', 'agency', 'corporate'])
    type?: string;

    @IsString()
    @IsOptional()
    @MaxLength(300)
    address?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    city?: string;

    @IsString()
    @IsOptional()
    @MaxLength(30)
    contactPhone?: string;
}
