'use strict';

describe('Component: newModule', function() {
  // load the component's module
  beforeEach(module('webAppApp.new_module'));

  var newModuleComponent;

  // Initialize the component and a mock scope
  beforeEach(inject(function($componentController) {
    newModuleComponent = $componentController('newModule', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
