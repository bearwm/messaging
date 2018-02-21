import { Gulpclass, MergedTask, SequenceTask, Task } from 'gulpclass';

import * as gulp from 'gulp';
import * as del from 'del';
import * as shell from 'gulp-shell';
import * as mocha from 'gulp-mocha';
import * as ts from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
const tslint = require('gulp-tslint');

@Gulpclass()
export class Gulpfile {

  /**
   * Cleans build folder.
   */
  @Task()
  clean(cb: Function) {
    return del(['./dist/**', './coverage/**'], cb);
  }

  /**
   * Runs typescript files compilation.
   */
  @Task()
  compile() {
    return gulp.src('./package.json', { read: false })
      .pipe(shell(['tsc']));
  }

  /**
   * Copies all sources to the package directory.
   */
  @MergedTask()
  packageCompile() {
    const tsProject = ts.createProject('tsconfig.json');
    const tsResult = gulp.src(['lib/**/*.ts'])
      .pipe(sourcemaps.init())
      .pipe(tsProject());

    return [
      tsResult.dts.pipe(gulp.dest('dist/package')),
      tsResult.js
        .pipe(sourcemaps.write('.', { sourceRoot: '', includeContent: true }))
        .pipe(gulp.dest('dist/package')),
    ];
  }

  /**
   * Moves all compiled files to the final package directory.
   */
  @Task()
  packageMoveCompiledFiles() {
    return gulp.src('./dist/package/lib/**/*')
      .pipe(gulp.dest('./dist/package'));
  }

  /**
   * Clears the directory with compiled files.
   */
  @Task()
  packageClearCompileDirectory(cb: Function) {
    return del(['dist/package/lib/**'], cb);
  }

  /**
   * Creates a package that can be published to npm.
   */
  @SequenceTask()
  package() {
    return [
      'clean',
      'packageCompile',
      'packageMoveCompiledFiles',
      'packageClearCompileDirectory',
    ];
  }

  /**
   * Runs unit-tests.
   */
  @Task()
  unit() {
    return gulp.src('./dist/compiled/test/**/*.js')
      .pipe(mocha());
  }

  /**
   * Runs the tslint.
   */
  @Task()
  tslint() {
    return gulp.src(['./lib/**/*.ts', './test/**/*.ts', './examples/**/*.ts'])
      .pipe(tslint({ formatter: 'stylish' }))
      .pipe(tslint.report({
        emitError: true,
        summarizeFailureOutput: true,
        sort: true,
        bell: true,
      }));
  }

  /**
   * Compiles the code and runs tests.
   */
  @SequenceTask()
  test() {
    return ['clean', 'compile', 'tslint', 'unit'];
  }
}
