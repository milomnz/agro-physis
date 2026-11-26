import * as bcrypt from 'bcryptjs';
import { DisabilityType, User, UserRole } from '../users/entities/user.entity';
import dataSource from './data-source';

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Administrador AgroPhysis';

  if (!email || !password) {
    console.error(
      'Debes definir ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env antes de ejecutar npm run seed:admin.',
    );
    process.exitCode = 1;
    return;
  }

  if (password.length < 6) {
    console.error('ADMIN_PASSWORD debe tener al menos 6 caracteres.');
    process.exitCode = 1;
    return;
  }

  await dataSource.initialize();

  try {
    const userRepo = dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash(password, 10);
    const existing = await userRepo.findOne({ where: { email } });

    if (existing) {
      existing.role = UserRole.ADMIN;
      existing.isActive = true;
      existing.password = hashedPassword;
      if (process.env.ADMIN_NAME?.trim()) {
        existing.name = name;
      }
      await userRepo.save(existing);
      console.log(
        `Usuario existente (${email}) actualizado y promovido al rol admin.`,
      );
      return;
    }

    const adminUser = userRepo.create({
      email,
      password: hashedPassword,
      name,
      role: UserRole.ADMIN,
      isActive: true,
      accessibilityProfile: {},
      disabilityType: DisabilityType.NINGUNA,
    });

    await userRepo.save(adminUser);
    console.log(`Usuario administrador creado exitosamente: ${email}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: Error) => {
  console.error('Error al ejecutar seed:admin:', error.message ?? error);
  process.exitCode = 1;
});
