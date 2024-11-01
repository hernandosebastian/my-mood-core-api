import { resolve } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import {
  Builder,
  Loader,
  Parser,
  Resolver,
  fixturesIterator,
} from 'typeorm-fixtures-cli/dist';

export const loadFixtures = async (
  fixturesPath: string,
  datasourceOptions: DataSourceOptions,
  fixtureOrder?: string[],
) => {
  let dataSource: DataSource | undefined = undefined;

  try {
    dataSource = new DataSource(datasourceOptions);
    await dataSource.initialize();
    await dataSource.synchronize(true);

    const loader = new Loader();
    loader.load(resolve(fixturesPath));

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(dataSource, new Parser(), false);

    if (fixtureOrder) {
      for (const entity of fixtureOrder) {
        for (const fixture of fixturesIterator(fixtures)) {
          if (fixture.entity === entity) {
            const entityInstance: any = await builder.build(fixture);
            await dataSource.getRepository(fixture.entity).save(entityInstance);
          }
        }
      }
    } else {
      for (const fixture of fixturesIterator(fixtures)) {
        const entityInstance: any = await builder.build(fixture);
        await dataSource.getRepository(fixture.entity).save(entityInstance);
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (dataSource) {
      await dataSource.destroy();
    }
  }
};
