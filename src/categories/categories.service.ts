/* eslint-disable prettier/prettier */
import { ForbiddenError } from '@casl/ability';
import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entity/user.entity';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Action } from 'src/casl/casl-action.enum';
import {  Repository } from 'typeorm';
import { CategoryEntity } from './entity/category.entity';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Injectable()
export class CategoriesService {
  //todo: SQL PostgreSQL không cần có Repository riêng vì typeorm hỗ trợ:
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    private caslAbilityFactory: CaslAbilityFactory, //CASL Role
  ) {}

  //!Create Category:
  async createCategory(category: CreateCategoryDto, user: UserEntity): Promise<CategoryEntity> {

    const caslAbility = this.caslAbilityFactory.createForUser(user)
    const newCategory = await this.categoryRepository.create(category);
    ForbiddenError.from(caslAbility)
      .setMessage('only admin !')
      .throwUnlessCan(Action.Create, newCategory);

    try {
      await this.categoryRepository.save(newCategory);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException(
          'Duplicate Category Name already exists',
        );
      } else {
        throw new InternalServerErrorException();
      }
    }

    return newCategory;
  }

  //!Get All Categories:
  getAllCategories(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({ relations: ['taskToCategory'] });
  }

  //!Get Category By Id:
  async getCategoryById(id: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne(id, {
      relations: ['taskToCategory'],
    });
    if (category) {
      return category;
    } else {
      throw new HttpException('Category Not Found', HttpStatus.NOT_FOUND);
    }

   
  }

  //!Update Category:
  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto, user: UserEntity): Promise<CategoryEntity> {
    //todo: CASL isAdmin isCreator:
    const caslAbility = this.caslAbilityFactory.createForUser(user)
    const categoryToUpdate = await this.getCategoryById(id);
    ForbiddenError.from(caslAbility)
      .setMessage('only admin!')
      .throwUnlessCan(Action.Update, categoryToUpdate);
      
    await this.categoryRepository.update(id, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.findOne(id, {
      relations: ['taskToCategory'],
    });

    if (updatedCategory) {
      return updatedCategory;
    } else {
      throw new HttpException('Category Not Found', HttpStatus.NOT_FOUND);
    }
   
  }

  //!Delete Category:
  async deleteCategory(id: number, user: UserEntity): Promise<void> {
    //todo: CASL isAdmin isCreator:
    const caslAbility = this.caslAbilityFactory.createForUser(user)
    const categoryToDelete = await this.getCategoryById(id);
    ForbiddenError.from(caslAbility)
      .setMessage('only admin!')
      .throwUnlessCan(Action.Delete, categoryToDelete);
      
    const deletedCategory = await this.categoryRepository.delete(id);
    if (!deletedCategory.affected) {
      throw new HttpException('Category Not Found', HttpStatus.NOT_FOUND);
    }
  }
}
