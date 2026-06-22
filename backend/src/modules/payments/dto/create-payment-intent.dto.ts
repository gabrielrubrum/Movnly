import { IsString, IsEmail, IsOptional, IsDateString, IsNumber, Min, Max, IsIn, Matches, IsObject, IsArray, MaxLength, IsNotEmpty, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, validate, Validate } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Custom validator to ensure at least one of origin/from is present
 */
@ValidatorConstraint({ name: 'hasOrigin', async: false })
export class HasOriginConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const object = args.object as any;
        return !!(object.origin || object.from);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Either origin or from must be provided';
    }
}

/**
 * Custom validator to ensure at least one of destination/to is present
 */
@ValidatorConstraint({ name: 'hasDestination', async: false })
export class HasDestinationConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const object = args.object as any;
        return !!(object.destination || object.to);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Either destination or to must be provided';
    }
}

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
    @Validate(HasOriginConstraint)
    @Validate(HasDestinationConstraint)
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
    @Transform(({ value }) => value?.trim())
    @IsOptional()
    from?: string;

    @IsString()
    @Transform(({ value }) => value?.trim())
    @IsOptional()
    to?: string;

    @IsString()
    @Transform(({ value }) => value?.trim())
    @IsOptional()
    origin?: string;

    @IsString()
    @Transform(({ value }) => value?.trim())
    @IsOptional()
    destination?: string;

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
