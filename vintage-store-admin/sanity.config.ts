import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Vintage Store Admin',

  projectId: 'j7s2sxwm',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Vintage Store Admin')
          .items([
            S.listItem()
              .title('New Orders')
              .child(
                S.documentList()
                  .title('New Orders')
                  .filter('_type == "order" && status == "new"')
                  .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
              ),
            S.listItem()
              .title('All Orders')
              .child(
                S.documentTypeList('order')
                  .title('All Orders')
                  .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter((listItem) => listItem.getId() !== 'order'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
