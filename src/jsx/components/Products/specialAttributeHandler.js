// Special attribute handler for AllProducts component
const handleSpecialAttributeChange = async (
  selectedOptions,
  selectEditItem,
  selectedSpecialAttributes,
  dispatch,
  getItemsThunk,
  setSelectedSpecialAttributes
) => {
  // Save the special attributes for the selected item
  if (selectEditItem?.id) {
    // First, get the currently selected special attributes
    const currentSpecialAttrs = selectedSpecialAttributes.map(attr => attr.value);
    const newSpecialAttrs = selectedOptions.map(option => option.value);
    
    // Find attributes to remove (in current but not in new)
    const toRemove = currentSpecialAttrs.filter(attrId => !newSpecialAttrs.includes(attrId));
    
    // Find attributes to add (in new but not in current)
    const toAdd = newSpecialAttrs.filter(attrId => !currentSpecialAttrs.includes(attrId));
    
    // Remove deselected special attributes
    for (const attrId of toRemove) {
      try {
        const response = await fetch(`/api/items/${selectEditItem.id}/special-attributes/${attrId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error(`Failed to remove special attribute ${attrId}`);
        }
      } catch (error) {
        console.error('Error removing special attribute:', error);
      }
    }
    
    // Add newly selected special attributes
    for (const attrId of toAdd) {
      try {
        const response = await fetch(`/api/items/${selectEditItem.id}/special-attributes/${attrId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error(`Failed to add special attribute ${attrId}`);
        }
      } catch (error) {
        console.error('Error adding special attribute:', error);
      }
    }
    
    // Update state
    setSelectedSpecialAttributes(selectedOptions);
    
    // 更新items存储中的special_attributes，这样UI会自动更新
    if (toAdd.length > 0 || toRemove.length > 0) {
      dispatch(getItemsThunk());
    }
  }
};

export default handleSpecialAttributeChange;