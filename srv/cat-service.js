export default class CatalogService extends cds.ApplicationService {
  init() {
    const { Books } = this.entities;

    this.on('createBook', async (req) => {
      const { ID, title, author } = req.data;
      await INSERT.into(Books).entries({ ID, title, author });
      return await SELECT.one.from(Books).where({ ID });
    });

    this.on('updateBook', async (req) => {
      const { ID, title } = req.data;
      await UPDATE(Books).set({ title }).where({ ID });
      return await SELECT.one.from(Books).where({ ID });
    });

    this.on('deleteBook', async (req) => {
  const { ID } = req.data;
  const deletedCount = await DELETE.from(Books).where({ ID });
  return deletedCount > 0;
});

    return super.init();
  }
};