from typing import List, Any
import traceback
from crewai.tools import BaseTool
from openclawd.classes.plugin_base import PluginBase
from litellm import ConfigDict
from pydantic import BaseModel, Field
from openclawd import WalletClientBase, get_tools
from openclawd.classes.tool_base import ToolBase

class OpenClawdToolWrapper(BaseTool):
    """A wrapper for executing OpenClawd tools within a CrewAI environment."""
    name: str
    description: str
    model_config = ConfigDict(arbitrary_types_allowed=True)
    openclawd_tool: ToolBase = Field(exclude=True)

    def __init__(self, openclawd_tool: ToolBase):
        if not hasattr(openclawd_tool, 'parameters') or not issubclass(openclawd_tool.parameters, BaseModel):
             raise ValueError(f"OpenClawd tool '{openclawd_tool.name}' has no Pydantic parameters model defined.")

        basetool_spec = {
            'name': openclawd_tool.name,
            'description': openclawd_tool.description,
            'args_schema': openclawd_tool.parameters,
            'openclawd_tool': openclawd_tool,
            'cache_function': lambda _args=None, _result=None: False, # never cache tools
            'result_as_answer': False,
        }
        super().__init__(**basetool_spec)


    def _run(
        self,
        **kwargs: Any
    ) -> Any:
        """Executes the wrapped OpenClawd tool."""
        try:
            return self.openclawd_tool.execute(kwargs)
        except Exception as e:
            # Get the full traceback
            error_details = traceback.format_exc()
            raise Exception(f"Error executing tool {self.name}: {error_details}")

def get_crewai_tools(wallet: WalletClientBase, plugins: List[PluginBase]) -> List[BaseTool]:
    """Create CrewAI-compatible tools from OpenClawd tools.

    Args:
        wallet: A wallet client instance
        plugins: List of plugin instances

    Returns:
        List of BaseTool instances ready for CrewAI Agents.
    """
    raw_tools: List[ToolBase] = get_tools(wallet=wallet, plugins=plugins)
    crewai_tools: List[BaseTool] = []

    for raw_tool in raw_tools:
        if hasattr(raw_tool, 'parameters') and raw_tool.parameters and issubclass(raw_tool.parameters, BaseModel):
            try:
                wrapper = OpenClawdToolWrapper(openclawd_tool=raw_tool)
                crewai_tools.append(wrapper)
            except Exception as e:
                print(f"Warning: Could not initialize wrapper for OpenClawd tool '{raw_tool.name}': {e}")
        else:
            print(f"Info: Skipping OpenClawd tool '{raw_tool.name}' as it lacks a Pydantic parameters model.")


    return crewai_tools