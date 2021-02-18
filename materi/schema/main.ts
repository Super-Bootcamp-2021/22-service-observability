///<reference path="./types.d.ts"/>

import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import spec from './todo.yaml';

spec.host = 'localhost:9000';

SwaggerUI({
  spec,
  dom_id: '#swagger',
});
