Folder structure notes:

Not entirely sure about the proper structure nor naming conventions.

The basic structure is 

renderer
-style
-views
--components
--style
--[view entry files]
-index
-secondary-index

Views is probably a misnomer. They are probably more properly a mixture of interfaces and views.

For future consideration:

break down folder structure into individual interface/view parts

renderer
-style
-components (for global components only such as blank-nav)
-history
-legacy
-config
-main
-secondary
-resource-manager
-bulk-namer
-builder

...I do like this better tbh