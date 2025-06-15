
import { useState, useCallback, useMemo } from 'react';

export interface ComposableComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComposableComponent[];
}

export interface CompositionState {
  components: ComposableComponent[];
  selectedComponent: string | null;
  isDirty: boolean;
}

export const useComposition = (initialComponents: ComposableComponent[] = []) => {
  const [state, setState] = useState<CompositionState>({
    components: initialComponents,
    selectedComponent: null,
    isDirty: false
  });

  const addComponent = useCallback((component: ComposableComponent, parentId?: string) => {
    setState(prev => {
      const newComponents = [...prev.components];
      
      if (parentId) {
        const findAndAddChild = (components: ComposableComponent[]): boolean => {
          for (const comp of components) {
            if (comp.id === parentId) {
              if (!comp.children) comp.children = [];
              comp.children.push(component);
              return true;
            }
            if (comp.children && findAndAddChild(comp.children)) {
              return true;
            }
          }
          return false;
        };
        
        findAndAddChild(newComponents);
      } else {
        newComponents.push(component);
      }
      
      return {
        ...prev,
        components: newComponents,
        isDirty: true
      };
    });
  }, []);

  const removeComponent = useCallback((id: string) => {
    setState(prev => {
      const filterComponents = (components: ComposableComponent[]): ComposableComponent[] => {
        return components
          .filter(comp => comp.id !== id)
          .map(comp => ({
            ...comp,
            children: comp.children ? filterComponents(comp.children) : undefined
          }));
      };
      
      return {
        ...prev,
        components: filterComponents(prev.components),
        selectedComponent: prev.selectedComponent === id ? null : prev.selectedComponent,
        isDirty: true
      };
    });
  }, []);

  const updateComponent = useCallback((id: string, updates: Partial<ComposableComponent>) => {
    setState(prev => {
      const updateInComponents = (components: ComposableComponent[]): ComposableComponent[] => {
        return components.map(comp => {
          if (comp.id === id) {
            return { ...comp, ...updates };
          }
          if (comp.children) {
            return {
              ...comp,
              children: updateInComponents(comp.children)
            };
          }
          return comp;
        });
      };
      
      return {
        ...prev,
        components: updateInComponents(prev.components),
        isDirty: true
      };
    });
  }, []);

  const selectComponent = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedComponent: id
    }));
  }, []);

  const getComponent = useCallback((id: string): ComposableComponent | null => {
    const findComponent = (components: ComposableComponent[]): ComposableComponent | null => {
      for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children) {
          const found = findComponent(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findComponent(state.components);
  }, [state.components]);

  const reset = useCallback(() => {
    setState({
      components: initialComponents,
      selectedComponent: null,
      isDirty: false
    });
  }, [initialComponents]);

  const selectedComponentData = useMemo(() => {
    return state.selectedComponent ? getComponent(state.selectedComponent) : null;
  }, [state.selectedComponent, getComponent]);

  return {
    components: state.components,
    selectedComponent: state.selectedComponent,
    selectedComponentData,
    isDirty: state.isDirty,
    addComponent,
    removeComponent,
    updateComponent,
    selectComponent,
    getComponent,
    reset
  };
};

export default useComposition;
