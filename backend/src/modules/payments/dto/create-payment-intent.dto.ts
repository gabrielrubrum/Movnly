import { IsString, IsEmail, IsOptional, IsDateString, IsNumber, Min, Max, IsIn, Matches, IsObject, IsArray, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Fraud Signals DTO
 * Contains anti-fraud detection signals from client
 */
export class FraudSignalsDto {
    @IsOptional()
    @IsString()
    ip?: string;

    @IsOptional()
    @IsString()
    userAgent?: string;

    @IsOptional()
    @IsString()
    fingerprint?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    riskScore?: number;

    @IsOptional()
    @IsArray()
    riskSignals?: string[];

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    billingCountry?: string;

    @IsOptional()
    @IsString()
    cardCountry?: string;

    @IsOptional()
    @IsString()
    browserCountry?: string;

    @IsOptional()
    @IsString()
    browserLocale?: string;
}

/**
 * Create PaymentIntent DTO
 * Validates and sanitizes payment intent creation requests
 */
export class CreatePaymentIntentDto {
    @IsOptional()
    @IsString()
    bookingId?: string;

    @IsEmail()
    @Transform(({ value }) => value?.trim().toLowerCase())
    email: string;

    @IsString()
    @Transform(({ value }) => value?.trim())
    @Matches(/^[a-zA-ZÀ-ÿ\s'-]{2,100}$/, {
        message: 'Name must contain only letters, spaces, hyphens, and apostrophes'
    })
    name: string;

    @IsString()
    @Transform(({ value, obj }) => {
        const val = (value || obj?.origin)?.trim();
        return val;
    })
    @IsNotEmpty()
    from: string;

    @IsString()
    @Transform(({ value, obj }) => {
        const val = (value || obj?.destination)?.trim();
        return val;
    })
    @IsNotEmpty()
    to: string;

    @IsDateString()
    date: string;

    @IsString()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time must be in HH:mm format'
    })
    time: string;

    @IsOptional()
    @IsIn(['smart', 'business', 'first', 'van'])
    category?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(20)
    @Type(() => Number)
    passengers?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    @Type(() => Number)
    luggage?: number;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim().toUpperCase())
    @Matches(/^[A-Z]{2}\d{3,4}$/, {
        message: 'Flight number must be in format like TP1234'
    })
    flightNumber?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone must be a valid international phone number'
    })
    phone?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
    notes?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim().toUpperCase())
    @Matches(/^[A-Z]{2}$/, {
        message: 'Country must be a valid ISO 3166-1 alpha-2 code'
    })
    country?: string;

    @IsOptional()
    @IsObject()
    fraudSignals?: FraudSignalsDto;
}
