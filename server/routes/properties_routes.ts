import { Router } from 'express';
import propertiesApiFactory, {
  PropertiesApi,
  testApi,
} from '../controllers/properties_api';
import connectionGenerator from '../database/init-db';
import { dbProductionOptions } from '../database/init-db';
import { Database } from 'better-sqlite3';

export default function propertiesRoutesFactory(dbPath: string): Router {
  const router: Router = Router();
  const db: Database = connectionGenerator(dbPath, dbProductionOptions);
  const propertiesApi: PropertiesApi = propertiesApiFactory(db);

  //Tests that the route is alive
  router.get('/test', testApi);

  //Gets properties from the Rightmove API
  router.get('/rightmove', propertiesApi.getRightmoveProperties);

  //Gets properties from the database
  router.get('/', propertiesApi.getProperties);

  //Gets a property by its ID
  router.get('/:id', propertiesApi.getPropertyById);

  //Gets a property by its identifier
  router.get(
    '/by-identifier/:identifier',
    propertiesApi.getPropertyByIdentifier,
  );

  //Gets the number of bedrooms for a property
  router.get('/bedrooms/:id', propertiesApi.getBedrooms);

  //Gets the monthly rent for a property
  router.get('/monthly-rent/:id', propertiesApi.getMonthlyRent);

  //Gets the identifier for a property
  router.get('/identifier/:id', propertiesApi.getIdentifier);

  //Gets the address for a property
  router.get('/address/:id', propertiesApi.getAddress);

  //Gets the contact phone for a property
  router.get('/contact-phone/:id', propertiesApi.getContactPhone);

  //Gets the summary for a property
  router.get('/summary/:id', propertiesApi.getSummary);

  //Updates a property
  router.put('/:id', propertiesApi.updateProperty);

  //Deletes a property
  router.delete('/:id', propertiesApi.deleteProperty);

  //Gets the URL of a property in Rightmove
  router.get('/url/:id', propertiesApi.getUrl);

  return router;
}
