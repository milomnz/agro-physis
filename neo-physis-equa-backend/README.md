<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Base de datos y migraciones

El esquema se gestiona con **migraciones de TypeORM**. `synchronize` está desactivado
(`app.module.ts`), por lo que los cambios de entidades **no** se aplican solos.

### Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
$ cp .env.example .env
```

| Variable | Descripción |
| --- | --- |
| `DB_HOST`, `DB_PORT` | Servidor PostgreSQL |
| `DB_NAME` | Nombre de la base (debe existir antes de migrar) |
| `DB_USER`, `DB_PASSWORD` | Credenciales |
| `JWT_SECRET` | Secreto para firmar los tokens |

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run migration:run` | Aplica las migraciones pendientes |
| `npm run migration:revert` | Deshace la última migración |
| `npm run migration:show` | Lista las migraciones y cuáles están aplicadas |
| `npm run migration:generate -- src/database/migrations/Nombre` | Genera una migración con el diff entre entidades y base |
| `npm run migration:baseline` | Marca la migración inicial como aplicada en una base ya existente |

### Base de datos nueva

```bash
$ npm run migration:run
```

### Base de datos que ya existía (creada con `synchronize: true`)

Esa base ya tiene las tablas pero no la tabla `migrations`, así que `migration:run`
falla con `ya existe un tipo «user_role»`. Hay dos opciones:

**1. Línea base (conserva los datos)** — recomendada:

```bash
$ npm run migration:baseline
$ npm run migration:show
```

Debe aparecer `[X] 1 InitialSchema1793048286926`. Luego confirma que la base coincide
con las entidades:

```bash
$ npm run migration:generate -- src/database/migrations/Check
```

Si responde `No changes in database schema were found`, está todo en orden. Si genera
una migración, revisa el diff y aplícala como una migración nueva.

**2. Empezar de cero (borra los datos locales)**:

```bash
$ psql -U postgres -d <DB_NAME> -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
$ npm run migration:run
```

### Cambios de esquema

Después de modificar una entidad:

```bash
$ npm run migration:generate -- src/database/migrations/DescripcionDelCambio
$ npm run migration:run
```

Revisa siempre el archivo generado antes de aplicarlo. Las migraciones **no** se
ejecutan al arrancar la aplicación: en cada entorno (incluido despliegue) hay que
correr `npm run migration:run`.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
