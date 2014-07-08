# Ho_Ajax
The idea is that it should be possible to load a block on a page without creating a new controller. Consider this as a partial-page reload framework.

In our own private frontend framework we've implemented ajax carts, ajax wishlists and live search without writing large scripts to do this.

In short, have an action source:
```HTML
<a href="#" data-ho-ajax-link="cart">foo</a>
```

And have target:
```HTML
<div data-ho-ajax="<?php echo $this->getNameInLayout(); ?>" data-ho-ajax-group="cart">
   ...
</div>
```

When the action is called, the target is reloaded.

## Cart Example:
When a customer presses their add to cart button (which can be a link or a form) you want to add the product to the cart but only reload the `cart.sidebar` block. You could achieve this by creating a new controller that only has the `cart.sidebar` block, serialize the response, send the response to the browser an replace the appropriate divs.

The problem with this approach is, that if a third party developer adds a block that shows some cart related data or renames the cart.sidebar block to something else, the implementation breaks.

To fix this we need a generalized javascript API that developers can easily hook into without breaking compatibility. We are using a data- attribute API to specifiy which parts of the page interact (links, forms) and which parts need to be reloaded when the action has completed.

## Action sources
We can have two action sources, `data-ho-ajax-link` and `data-ho-ajax-form` and direct API calls.

### Links
We have the following cart button

```HTML
<a title="<?php echo Mage::helper('catalog')->__('Add to Cart') ?>"
        class="btn btn-cart btn-default"
        data-ho-ajax-link="cart"
        href="<?php echo $this->getAddToCartUrl($_childProduct) ?>"
        rel="nofollow">
    <?php echo Mage::helper('catalog')->__('Add to Cart') ?>
</a>
```

You can see the `data-ho-ajax-link` attribute that specifies that it is a link that is going to reload parts of the page and the content of that attribute specifies that it needs to reload all the `cart` blocks.

### Forms

*Forms are still experimental, since the form is serialzed and does a POST over javascript, which can cause problems with file uploads*

```HTML
<form method="get" class="form-search" role="search" data-ho-ajax-form="ajaxsearch">
    <div class="input-group">
        <input id="ajaxsearch-input" type="text"
               name="<?php echo $catalogSearchHelper->getQueryParamName() ?>"
               value="<?php echo $catalogSearchHelper->getEscapedQueryText() ?>"
               class="form-control"
               autocomplete="off"
               maxlength="<?php echo $catalogSearchHelper->getMaxQueryLength();?>"
               placeholder="<?php echo $this->getSearchPlaceholder();?>"
            />
        <span class="input-group-btn">
            <button type="submit" title="<?php echo $this->__('Search') ?>" class="btn btn-default" id="ajaxsearch-button"><?php echo $this->__('Search') ?></button>
        </span>
    </div>
</form>
```

Here you can see the `data-ho-ajax-form` element which specifies that the form is going to reload parts of the page and the content of that attribute specifies that is needs to reload all `ajaxsearch` blocks.

### Direct API

You can refresh the page directly

```JS
$(document).hoAjax('refreshPage', 'cart');
```


## Blocks
In the template of the block that needs to be reloaded, we add two attributes, one with the name of the block and another with the

```HTML
<div class="cart" data-ho-ajax="<?php echo $this->getNameInLayout(); ?>" data-ho-ajax-group="cart account">
	...
</div>
```

When loading calling an action that has the group `cart` the script searches the DOM to find all blocks with data-ho-ajax-group = cart.

## Messages
The messages are appended to a special messages block which we render fixed at the top of the page. the messages block has the group `all` and always gets refreshed on each page load.


## JS API

### refreshPage
Refreshes all the blocks that are in a certain group.

```JS
$(document).hoAjax('refreshPage', 'cart');
```

### getBlocks

Get all dynamic blocks on the page
```JS
var group = cart; //can be undefined to get all blocks
$(document).hoAjax('getBlocks', group);
```

### getBlock

Get a single block by the name in the layout
```JS
var blockName = 'cart.header';
$(document).hoAjax('getBlocks', blockName);
```

## Events

We trigger the following events:

```JS
//when a link is pressed, this is triggered immediately
$link.trigger('requestStart.hoajax');
$link.trigger('requestStartGroup.hoajax'+group);

//when a form is submitted, this is triggered immediately
$form.trigger('requestStart.hoajax');
$form.trigger('requestStartGroup.hoajax'+group);

//After the response has returned, before rendering all blocks
$(document).trigger('responseStart.hoajax');
$(document).trigger('responseStartGroup.hoajax.'+group);

//When a certain block is rendered
$(document).trigger('responseFinishBlock.hoajax.'+blockName);

//After the response has returned, after rendering all blocks
$(document).trigger('responseFinish.hoajax');
$(document).trigger('responseFinishGroup.hoajax.'+group);
```

You can use them in the following way:

```JS
$(document).on('responseFinishGroup.hoajax.cart', function(){
	//Do some additional stuff
});
```


# Credits
Credits for the idea go to https://github.com/hws47a/VF_EasyAjax. I've completely rewritten the module to suit our needs.
