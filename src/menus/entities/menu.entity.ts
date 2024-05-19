import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ length: 50 })
  icon: string;

  @Column({ length: 50, nullable: true })
  path: string;

  @Column({ type: 'smallint' })
  sort: number;

  @Exclude({ toPlainOnly: true })
  parentId: number;

  @ManyToOne(() => Menu, (menu) => menu.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  @ManyToMany(() => Permission, (permission) => permission.menus, {
    eager: true,
  })
  @JoinTable({
    name: 'menu_has_permissions',
    joinColumn: { name: 'menu_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: Permission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Menu>) {
    Object.assign(this, partial);
  }
}
