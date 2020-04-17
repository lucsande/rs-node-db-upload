import Category from '../models/Category';
import { Repository, getRepository } from 'typeorm';

class CategoryServices {
  private createCatRepo(): Repository<Category> {
    return getRepository(Category);
  }

  public async findOrCreateByTitle(title: string): Promise<Category> {
    const catRepo = this.createCatRepo();
    
    const existingCats = await catRepo.find({ where: { title } });
    const existingCat = existingCats[0];

    if (existingCat) return existingCat;

    const newCat = catRepo.create({ title });
    const createdCat = await catRepo.save(newCat);
    return createdCat;
  }
}

export default CategoryServices;
