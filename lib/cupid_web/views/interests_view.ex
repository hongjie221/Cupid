defmodule CupidWeb.InterestsView do
  use CupidWeb, :view
  alias CupidWeb.InterestsView
  alias Cupid.Tags

  def render("index.json", %{interest: interest}) do
    %{data: render_many(interest, InterestsView, "interests.json")}
  end

  def render("show.json", %{interests: interests}) do
    %{data: render_one(interests, InterestsView, "interests.json")}
  end

  def render("interests.json", %{interests: interests}) do
    name = Tags.get_tag!(interests.tag_id).name
    %{id: interests.id, tag_id: interests.tag_id, tag_name: name}
  end

  def render("success.json", _) do
    %{data: "success"}
  end

  def render("browse.json", %{match_user: match_user}) do
    %{data: render_many(match_user, InterestsView, "browse_result.json")}
  end

  def render("browse_result.json", %{interests: match_user}) do


    %{
      user_id: match_user.id,
      user_name: match_user.name,
      user_desc: match_user.desc,
      user_addr: match_user.addr
    }
  end
end
