# syntax=docker/dockerfile:1

FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update \
 	&& apt-get install -y --no-install-recommends \
 		git \
 		unzip \
 		libzip-dev \
 		libonig-dev \
 		libpng-dev \
 		libicu-dev \
 		libfreetype6-dev \
 		libjpeg62-turbo-dev \
 		default-mysql-client \
 		libpq-dev \
 	&& rm -rf /var/lib/apt/lists/*

# Install build dependencies for MySQL extensions
RUN apt-get update \
 	&& apt-get install -y --no-install-recommends \
 		$PHPIZE_DEPS \
 		libmysqlclient-dev \
 	&& rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 	&& docker-php-ext-configure zip \
 	&& docker-php-ext-install -j$(nproc) \
 		pdo \
 		pdo_mysql \
 		mysqli \
 		zip \
 		gd \
 		intl \
 		mbstring \
 		opcache \
 		bcmath

# Keep libmysqlclient-dev for runtime (required for pdo_mysql and mysqli)
# Only remove build tools
RUN apt-get purge -y --auto-remove $PHPIZE_DEPS \
 	&& apt-get clean \
 	&& rm -rf /var/lib/apt/lists/*

# Verify MySQL extensions are installed
RUN php -m | grep -i mysql || (echo "ERROR: MySQL extensions not found!" && php -m && exit 1)

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy only composer files first to leverage layer caching
COPY composer.json composer.lock ./

# Create dirs required by Composer before install (in case of volume mount later)
RUN mkdir -p /var/www/html/vendor

# Install PHP dependencies (prefer dist for speed in CI, keep dev for local env)
RUN composer install --no-interaction --prefer-dist --no-scripts --no-progress

# Copy application source
COPY . .

# Ensure storage and cache are writable
RUN chown -R www-data:www-data /var/www/html \
 	&& chmod -R 775 storage bootstrap/cache

# Copy entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]


