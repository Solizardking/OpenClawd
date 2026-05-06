from typing import List, Any, Dict, get_origin, Optional, Type
import inspect
import traceback
from openclawd.classes.plugin_base import PluginBase
from pydantic import BaseModel
from openclawd import WalletClientBase, get_tools
from openclawd.classes.tool_base import ToolBase
from packages.python.src.adapters.smolagents.openclawd_adapters.smolagents import Tool

def python_type_to_json_schema_type(python_type: Type) -> str:
    """Convert Python type to JSON Schema type string."""
    if python_type is str or python_type is Optional[str]:
        return "string"
    elif python_type is int or python_type is Optional[int]:
        return "integer"
    elif python_type is float or python_type is Optional[float]:
        return "number"
    elif python_type is bool or python_type is Optional[bool]:
        return "boolean"
    elif get_origin(python_type) is list or get_origin(python_type) is List:
        return "array"
    elif get_origin(python_type) is dict or get_origin(python_type) is Dict:
        return "object"
    elif python_type is None or python_type is type(None):
        return "null"
    else:
        # For complex types or when unsure, use string as fallback
        return "string"

class OpenClawdToolWrapper(Tool):
    """A wrapper for executing OpenClawd tools within a Smolagents environment."""
    
    def __init__(self, openclawd_tool: ToolBase):
        if not hasattr(openclawd_tool, 'parameters') or not issubclass(openclawd_tool.parameters, BaseModel):
            raise ValueError(f"OpenClawd tool '{openclawd_tool.name}' has no Pydantic parameters model defined.")
        
        self.openclawd_tool = openclawd_tool
        self.name = openclawd_tool.name
        self.description = openclawd_tool.description
        
        # We have a dynamic forward method, with our own validation
        self.skip_forward_signature_validation = True
        
        # Convert OpenClawd tool parameters to Smolagents inputs format
        self.inputs = {}
        if hasattr(openclawd_tool, 'parameters'):
            # Using Pydantic v2 model_fields
            model_fields = getattr(openclawd_tool.parameters, "model_fields", {})
            for field_name, field_info in model_fields.items():
                # Get field type from annotation
                python_type = field_info.annotation
                
                # Convert Python type to JSON schema type
                field_type = python_type_to_json_schema_type(python_type)
                
                # Get field description
                field_description = getattr(field_info, "description", "") or f"Parameter {field_name}"
                
                self.inputs[field_name] = {
                    "type": field_type,
                    "description": field_description
                }
        
        # Try to determine output_type from the execute method's return annotation
        try:
            return_type = inspect.signature(openclawd_tool.execute).return_annotation
            if return_type is not inspect.Signature.empty:
                self.output_type = python_type_to_json_schema_type(return_type)
            else:
                # Default to string if no return annotation
                self.output_type = "string"
        except (ValueError, TypeError):
            # If we can't determine the return type, default to string
            self.output_type = "string"
        
        super().__init__()

    def forward(self, **kwargs: Any) -> Any:
        """Executes the wrapped OpenClawd tool."""
        try:
            return self.openclawd_tool.execute(kwargs)
        except Exception as e:
            # Get the full traceback
            error_details = traceback.format_exc()
            raise Exception(f"Error executing tool {self.name}: {error_details}")

def get_smolagents_tools(wallet: WalletClientBase, plugins: List[PluginBase]) -> List[Tool]:
    """Create Smolagents-compatible tools from OpenClawd tools.

    Args:
        wallet: A wallet client instance
        plugins: List of plugin instances

    Returns:
        List of Tool instances ready for Smolagents Agents.
    """
    raw_tools: List[ToolBase] = get_tools(wallet=wallet, plugins=plugins)
    smolagents_tools: List[Tool] = []

    for raw_tool in raw_tools:
        if hasattr(raw_tool, 'parameters') and raw_tool.parameters and issubclass(raw_tool.parameters, BaseModel):
            try:
                wrapper = OpenClawdToolWrapper(openclawd_tool=raw_tool)
                smolagents_tools.append(wrapper)
            except Exception as e:
                print(f"Warning: Could not initialize wrapper for OpenClawd tool '{raw_tool.name}': {e}")
        else:
            print(f"Info: Skipping OpenClawd tool '{raw_tool.name}' as it lacks a Pydantic parameters model.")

    return smolagents_tools